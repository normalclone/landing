'use client'

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import "./PageTransitionBee.css"

const POLLEN_COUNT = 12
const LEAVE_DELAY = 900
const HIDE_DELAY = 1400
const DEBUG_STORAGE_KEY = "bee-loader-debug"

type BeeLoaderWindow = Window & {
  toggleBeeLoaderDebug?: (enabled?: boolean) => void
}

export function PageTransitionBee() {
  const pathname = usePathname()
  const [isActive, setIsActive] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const reduceMotionRef = useRef(false)
  const debugModeRef = useRef(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visibilityRef = useRef<boolean | null>(null)

  const clearTimers = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const startSequence = useCallback(() => {
    clearTimers()

    if (reduceMotionRef.current || debugModeRef.current) {
      setIsActive(debugModeRef.current)
      setIsLeaving(false)
      return
    }

    setIsActive(true)
    setIsLeaving(false)

    leaveTimerRef.current = setTimeout(() => {
      setIsLeaving(true)
    }, LEAVE_DELAY)

    hideTimerRef.current = setTimeout(() => {
      setIsActive(false)
      setIsLeaving(false)
    }, HIDE_DELAY)
  }, [clearTimers])

  const applyDebugMode = useCallback(
    (enabled: boolean) => {
      debugModeRef.current = enabled

      if (enabled) {
        clearTimers()
        setIsActive(true)
        setIsLeaving(false)
      } else {
        clearTimers()
        setIsActive(false)
        setIsLeaving(false)
      }
    },
    [clearTimers]
  )

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    reduceMotionRef.current = media.matches

    const handleChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches
      if (event.matches) {
        clearTimers()
        setIsActive(false)
        setIsLeaving(false)
      }
    }

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange)
    } else if (typeof media.addListener === "function") {
      media.addListener(handleChange)
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleChange)
      } else if (typeof media.removeListener === "function") {
        media.removeListener(handleChange)
      }
    }
  }, [clearTimers])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const win = window as BeeLoaderWindow

    const handleHashChange = () => {
      const hasDebug = window.location.hash.includes("debug-loader")
      if (hasDebug !== debugModeRef.current) {
        applyDebugMode(hasDebug)
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === DEBUG_STORAGE_KEY) {
        applyDebugMode(event.newValue === "1")
      }
    }

    const toggleDebug = (enabled?: boolean) => {
      const value = typeof enabled === "boolean" ? enabled : !debugModeRef.current
      window.localStorage.setItem(DEBUG_STORAGE_KEY, value ? "1" : "0")
      applyDebugMode(value)
    }

    win.toggleBeeLoaderDebug = toggleDebug

    const initialDebug =
      window.location.hash.includes("debug-loader") ||
      window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1"

    if (initialDebug) {
      applyDebugMode(true)
    }

    window.addEventListener("hashchange", handleHashChange)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      window.removeEventListener("storage", handleStorage)
      delete win.toggleBeeLoaderDebug
    }
  }, [applyDebugMode])

  useEffect(() => {
    if (debugModeRef.current) {
      setIsActive(true)
      setIsLeaving(false)
      return
    }

    startSequence()

    return () => {
      clearTimers()
    }
  }, [pathname, startSequence, clearTimers])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const isVisible = isActive || isLeaving
    if (visibilityRef.current === null || visibilityRef.current !== isVisible) {
      const eventName = isVisible ? "bee-loader:start" : "bee-loader:end"
      const dispatch = () => window.dispatchEvent(new CustomEvent(eventName))

      if (typeof queueMicrotask === "function") {
        queueMicrotask(dispatch)
      } else {
        Promise.resolve().then(dispatch)
      }

      visibilityRef.current = isVisible
    }
  }, [isActive, isLeaving])

  if (!isActive && !isLeaving) {
    return null
  }

  return (
    <div
      className={[
        "beeloader__overlay",
        isActive && !isLeaving ? "beeloader__overlay--visible" : "",
        isLeaving ? "beeloader__overlay--leaving" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div className="beeloader__container">
        <div className="beeloader__bee">
          <div className="beeloader__body">
            <div className="beeloader__line" />
          </div>
          <div>
            <div className="beeloader__wing-right" />
            <div className="beeloader__wing-left" />
          </div>
          <div className="beeloader__path">
            {Array.from({ length: POLLEN_COUNT }).map((_, index) => (
              <div key={index} className="beeloader__pollen" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
