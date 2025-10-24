'use client'

import { useLayoutEffect, useRef } from "react"

const CUSTOM_EVENT_NAME = "scrollbar:compensation-check"

export function ScrollbarCompensationManager() {
  const measuredWidthRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return
    }

    const measureScrollbarWidth = () => {
      if (measuredWidthRef.current !== null) {
        return measuredWidthRef.current
      }

      const scrollContainer = document.createElement("div")
      scrollContainer.style.position = "absolute"
      scrollContainer.style.top = "-9999px"
      scrollContainer.style.width = "100px"
      scrollContainer.style.height = "100px"
      scrollContainer.style.overflow = "scroll"
      scrollContainer.style.msOverflowStyle = "scrollbar"

      const inner = document.createElement("div")
      inner.style.width = "100%"
      inner.style.height = "100%"

      scrollContainer.appendChild(inner)
      document.body.appendChild(scrollContainer)

      const width = Math.max(scrollContainer.offsetWidth - scrollContainer.clientWidth, 0)
      measuredWidthRef.current = width

      document.body.removeChild(scrollContainer)

      return measuredWidthRef.current
    }

    let rafId: number | null = null

    const applyCompensation = () => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return
      }

      const root = document.documentElement
      const body = document.body

      if (body.classList.contains("modal-open")) {
        return
      }

      const hasVerticalScroll = root.scrollHeight > window.innerHeight

      if (!hasVerticalScroll) {
        const scrollbarWidth = measureScrollbarWidth()
        const value = `${scrollbarWidth}px`
        root.style.setProperty("--scrollbar-compensation", value)
        body.style.setProperty("--scrollbar-compensation", value)
      } else {
        root.style.removeProperty("--scrollbar-compensation")
        body.style.removeProperty("--scrollbar-compensation")
      }
    }

    const scheduleCompensation = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(() => {
        applyCompensation()
        rafId = null
      })
    }

    applyCompensation()

    window.addEventListener("resize", scheduleCompensation)
    window.addEventListener("orientationchange", scheduleCompensation)
    window.addEventListener(CUSTOM_EVENT_NAME, scheduleCompensation)

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(scheduleCompensation)
      observer.observe(document.documentElement)
      observer.observe(document.body)

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }
        window.removeEventListener("resize", scheduleCompensation)
        window.removeEventListener("orientationchange", scheduleCompensation)
        window.removeEventListener(CUSTOM_EVENT_NAME, scheduleCompensation)
        observer.disconnect()
      }
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener("resize", scheduleCompensation)
      window.removeEventListener("orientationchange", scheduleCompensation)
      window.removeEventListener(CUSTOM_EVENT_NAME, scheduleCompensation)
    }
  }, [])

  return null
}

export function dispatchScrollbarCompensationCheck() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(CUSTOM_EVENT_NAME))
}
