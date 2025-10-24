'use client'

import { useCallback, useEffect, useState } from "react"
import "./FloatingThemeToggle.css"

type Theme = "light" | "dark"

const storageKey = "beexamine-theme"

function determinePreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light"
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored === "light" || stored === "dark") {
      return stored
    }
  } catch {
    // Ignore read errors (e.g. private/broken storage)
  }

  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }

  return "light"
}

function persistTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-bs-theme", theme)
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch {
      // Ignore persistence errors
    }
  }
}

export function FloatingThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")
  const [isReady, setIsReady] = useState(false)
  const [isLoaderActive, setIsLoaderActive] = useState(true)

  useEffect(() => {
    const initialTheme = determinePreferredTheme()
    setTheme(initialTheme)
    persistTheme(initialTheme)
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }
    persistTheme(theme)
  }, [theme, isReady])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleLoaderStart = () => setIsLoaderActive(true)
    const handleLoaderEnd = () => setIsLoaderActive(false)

    window.addEventListener("bee-loader:start", handleLoaderStart)
    window.addEventListener("bee-loader:end", handleLoaderEnd)

    return () => {
      window.removeEventListener("bee-loader:start", handleLoaderStart)
      window.removeEventListener("bee-loader:end", handleLoaderEnd)
    }
  }, [])

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  if (!isReady || isLoaderActive) {
    return null
  }

  const nextThemeLabel = theme === "dark" ? "sáng" : "tối"

  return (
    <div className="floating-theme-toggle-wrapper">
      <button
        type="button"
        id="themeToggle"
        className={`floating-theme-toggle${theme === "dark" ? " is-dark" : ""}`}
        aria-label={`Chuyển sang giao diện ${nextThemeLabel}`}
        onClick={handleToggleTheme}
      >
        <span className="sr-only">
          {`Chuyển sang giao diện ${nextThemeLabel}`}
        </span>
        <span className="floating-theme-toggle__icon-wrapper" aria-hidden="true">
          <svg
            className="floating-theme-toggle__icon floating-theme-toggle__icon--sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg
            className="floating-theme-toggle__icon floating-theme-toggle__icon--moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </span>
      </button>
    </div>
  )
}
