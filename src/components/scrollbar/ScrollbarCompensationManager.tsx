'use client'

import { useLayoutEffect, useRef } from "react"

const CUSTOM_EVENT_NAME = "scrollbar:compensation-check"
const BEE_LOADER_START_EVENT = "bee-loader:start"
const BEE_LOADER_END_EVENT = "bee-loader:end"
const BEE_LOCK_FLAG = "beeLoaderScrollLock"
const BEE_PREV_ROOT = "beeLoaderPrevScrollbarCompensationRoot"
const BEE_PREV_BODY = "beeLoaderPrevScrollbarCompensationBody"
const EMPTY_MARKER = "__EMPTY__"

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

      if (body.classList.contains("modal-open") || body.classList.contains("bee-loader-active")) {
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

    const toStoredValue = (value: string) => (value.trim() ? value : EMPTY_MARKER)

    const restoreCompensation = (target: HTMLElement, stored?: string) => {
      if (typeof stored === "undefined") {
        return
      }

      if (stored === EMPTY_MARKER) {
        target.style.removeProperty("--scrollbar-compensation")
      } else {
        target.style.setProperty("--scrollbar-compensation", stored)
      }
    }

    const handleBeeLoaderStart = () => {
      const root = document.documentElement
      const body = document.body

      if (body.classList.contains("modal-open") || body.dataset[BEE_LOCK_FLAG] === "1") {
        return
      }

      const scrollbarWidth = Math.max(window.innerWidth - root.clientWidth, 0)

      const previousRootCompensation = root.style.getPropertyValue("--scrollbar-compensation")
      const previousBodyCompensation = body.style.getPropertyValue("--scrollbar-compensation")

      body.dataset[BEE_PREV_ROOT] = toStoredValue(previousRootCompensation)
      body.dataset[BEE_PREV_BODY] = toStoredValue(previousBodyCompensation)

      if (scrollbarWidth > 0) {
        const compensation = `${scrollbarWidth}px`
        root.style.setProperty("--scrollbar-compensation", compensation)
        body.style.setProperty("--scrollbar-compensation", compensation)
      } else {
        root.style.removeProperty("--scrollbar-compensation")
        body.style.removeProperty("--scrollbar-compensation")
      }

      body.classList.add("bee-loader-active")
      body.dataset[BEE_LOCK_FLAG] = "1"
    }

    const handleBeeLoaderEnd = () => {
      const root = document.documentElement
      const body = document.body

      if (body.dataset[BEE_LOCK_FLAG] !== "1") {
        scheduleCompensation()
        return
      }

      body.classList.remove("bee-loader-active")

      restoreCompensation(root, body.dataset[BEE_PREV_ROOT])
      restoreCompensation(body, body.dataset[BEE_PREV_BODY])

      delete body.dataset[BEE_PREV_ROOT]
      delete body.dataset[BEE_PREV_BODY]
      delete body.dataset[BEE_LOCK_FLAG]

      scheduleCompensation()
    }

    window.addEventListener("resize", scheduleCompensation)
    window.addEventListener("orientationchange", scheduleCompensation)
    window.addEventListener(CUSTOM_EVENT_NAME, scheduleCompensation)
    window.addEventListener(BEE_LOADER_START_EVENT, handleBeeLoaderStart)
    window.addEventListener(BEE_LOADER_END_EVENT, handleBeeLoaderEnd)

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
        window.removeEventListener(BEE_LOADER_START_EVENT, handleBeeLoaderStart)
        window.removeEventListener(BEE_LOADER_END_EVENT, handleBeeLoaderEnd)
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
      window.removeEventListener(BEE_LOADER_START_EVENT, handleBeeLoaderStart)
      window.removeEventListener(BEE_LOADER_END_EVENT, handleBeeLoaderEnd)
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
