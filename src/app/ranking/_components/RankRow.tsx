'use client'

import type { LeaderTab, StudentLeader, TeacherLeader } from "../types"

type RankMetric = {
  label: string
  valueText: string
  helperText?: string
}

type RankRowProps = {
  leader: StudentLeader | TeacherLeader
  tab: LeaderTab
  metric: RankMetric
  classNames: {
    chip: string
    outlineButton: string
  }
  onHover: (leader: StudentLeader | TeacherLeader, rect: DOMRect) => void
  onLeave: () => void
  onViewProfile: (leader: StudentLeader | TeacherLeader) => void
}

export function RankRow({ leader, tab, metric, classNames, onHover, onLeave, onViewProfile }: RankRowProps) {
  const avatarAlt = `Ảnh đại diện của ${leader.name}`
  const contextLabel = tab === "students" ? (leader as StudentLeader).classLabel : (leader as TeacherLeader).organization

  return (
    <article
      className="card card-surface shadow-sm p-3 p-md-4 position-relative"
      onMouseEnter={(event) => onHover(leader, event.currentTarget.getBoundingClientRect())}
      onMouseLeave={onLeave}
    >
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="badge bg-light text-slate border fw-bold px-3 py-2">{leader.rank}</span>
            <div className="d-flex align-items-center gap-3">
              <span
                className="rounded-circle overflow-hidden flex-shrink-0"
                style={{ width: 48, height: 48, backgroundColor: "#f3f4f6" }}
              >
                <img src={leader.avatar} alt={avatarAlt} width={48} height={48} style={{ objectFit: "cover" }} />
              </span>
              <div>
                <div className="fw-semibold fs-5">
                  <a href={`/profile/${leader.id}`} className="text-decoration-none stretched-link">
                    {leader.name}
                  </a>
                </div>
                {contextLabel ? <div className="text-slate small">{contextLabel}</div> : null}
              </div>
            </div>
          </div>

          <div className="text-end">
            <div className="text-uppercase text-slate small fw-semibold">{metric.label}</div>
            <div className="fs-4 fw-bold text-indigo">{metric.valueText}</div>
            {metric.helperText ? <div className="text-slate small">{metric.helperText}</div> : null}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          {leader.badges.map((badge) => (
            <span key={badge} className={classNames.chip}>
              {badge}
            </span>
          ))}
          <button
            type="button"
            className={`${classNames.outlineButton} btn-sm ms-auto`}
            onClick={() => onViewProfile(leader)}
          >
            Xem hồ sơ
          </button>
        </div>
      </div>
    </article>
  )
}
