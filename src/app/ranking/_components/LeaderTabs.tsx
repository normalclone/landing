'use client'

import type { LeaderTab } from "../types"

const TAB_ITEMS: Array<{ value: LeaderTab; label: string; description: string }> = [
  {
    value: "students",
    label: "Sinh viên",
    description: "Top học viên nổi bật",
  },
  {
    value: "teachers",
    label: "Giáo viên",
    description: "Top giảng viên đóng góp",
  },
]

type LeaderTabsProps = {
  activeTab: LeaderTab
  onTabChange: (tab: LeaderTab) => void
}

export function LeaderTabs({ activeTab, onTabChange }: LeaderTabsProps) {
  return (
    <div className="d-flex flex-wrap gap-2" role="tablist" aria-label="Chọn bảng xếp hạng">
      {TAB_ITEMS.map((tab) => {
        const isActive = tab.value === activeTab
        const buttonClassName = `btn ${isActive ? "btn-indigo" : "btn-outline-secondary"}`

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={buttonClassName}
            onClick={() => onTabChange(tab.value)}
          >
            <div className="fw-semibold">{tab.label}</div>
            <div className="small text-slate">{tab.description}</div>
          </button>
        )
      })}
    </div>
  )
}
