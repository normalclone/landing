'use client'

import type {
  LeaderCategory,
  LeaderTab,
  StudentSortOption,
  TeacherSortOption,
  TimeframeOption,
} from "../types"

type FilterState = {
  category: LeaderCategory
  timeframe: TimeframeOption
  sortBy: StudentSortOption | TeacherSortOption
}

type Option<T extends string> = {
  value: T
  label: string
  description?: string
}

type SidebarFiltersProps = {
  tab: LeaderTab
  draftFilters: FilterState
  categoryOptions: Array<Option<LeaderCategory>>
  timeframeOptions: Array<Option<TimeframeOption>>
  sortOptions: Array<Option<StudentSortOption | TeacherSortOption>>
  onCategoryChange: (value: LeaderCategory) => void
  onTimeframeChange: (value: TimeframeOption) => void
  onSortChange: (value: StudentSortOption | TeacherSortOption) => void
  onApply: () => void
  onReset: () => void
  classNames: {
    sidebarCard: string
    select: string
    primaryButton: string
    iconButton: string
  }
}

export function SidebarFilters({
  tab,
  draftFilters,
  categoryOptions,
  timeframeOptions,
  sortOptions,
  onCategoryChange,
  onTimeframeChange,
  onSortChange,
  onApply,
  onReset,
  classNames,
}: SidebarFiltersProps) {
  return (
    <aside data-animate className="col-12 col-lg-3 fade-in-up">
      <div
        data-animate
        className={`${classNames.sidebarCard} fade-in-up`}
        style={{ position: "sticky", top: "6.5rem" }}
      >
        <div className="card-body">
          <h2 className="h5 fw-semibold mb-4">Bộ lọc xếp hạng</h2>

          {/* Kỳ thi / nhóm */}
          <div className="mb-4">
            <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
              Kỳ thi / nhóm
            </span>
            <div className="d-grid gap-2">
              {categoryOptions.map((option) => (
                <label key={option.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="leader-category"
                    value={option.value}
                    checked={draftFilters.category === option.value}
                    onChange={() => onCategoryChange(option.value)}
                  />
                  <span className="form-check-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thời gian */}
          <div className="mb-4">
            <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
              Thời gian
            </span>
            <div className="d-grid gap-2">
              {timeframeOptions.map((option) => (
                <label key={option.value} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="leader-timeframe"
                    value={option.value}
                    checked={draftFilters.timeframe === option.value}
                    onChange={() => onTimeframeChange(option.value)}
                  />
                  <span className="form-check-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="mb-4">
            <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
              Sắp xếp theo ({tab === "students" ? "Sinh viên" : "Giáo viên"})
            </span>
            <select
              className={classNames.select}
              value={draftFilters.sortBy}
              onChange={(event) => onSortChange(event.target.value as StudentSortOption | TeacherSortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={classNames.iconButton}
              onClick={onReset}
              aria-label="Xóa bộ lọc"
            >
              <span className="visually-hidden">Xóa bộ lọc</span>
              <span aria-hidden="true" className="btn-icon__glyph">
                x
              </span>
            </button>
            <button className={`${classNames.primaryButton} flex-grow-1`} type="button" onClick={onApply}>
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
