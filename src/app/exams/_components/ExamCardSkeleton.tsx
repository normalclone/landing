'use client'

import type { FC } from "react"

const BASE_BADGE_WIDTHS = ["48%", "38%", "42%", "58%"] as const
const DETAIL_LINE_WIDTHS = ["92%", "86%", "72%", "64%"] as const

const renderSkeletonLine = (width: string, height: string, className?: string) => (
  <div
    className={`skeleton-block${className ? ` ${className}` : ""}`}
    style={{ width, height }}
  />
)

export const ExamCardSkeleton: FC = () => {
  return (
    <div className="exam-card-skeleton card card-surface shadow-sm h-100" aria-hidden="true">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-column gap-2">
          {renderSkeletonLine("72%", "1.1rem")}
          {renderSkeletonLine("54%", "0.75rem")}
        </div>

        <div className="d-flex flex-wrap gap-2">
          {BASE_BADGE_WIDTHS.map((width, index) => (
            <div key={index} className="skeleton-block skeleton-pill" style={{ width }} />
          ))}
        </div>

        <div className="d-flex flex-column gap-2">
          {DETAIL_LINE_WIDTHS.map((width, index) =>
            renderSkeletonLine(width, "0.65rem", index === 0 ? "mt-1" : undefined)
          )}
        </div>

        <div className="mt-auto d-flex justify-content-between gap-2">
          {renderSkeletonLine("42%", "0.85rem")}
          {renderSkeletonLine("28%", "0.85rem")}
        </div>
      </div>
    </div>
  )
}
