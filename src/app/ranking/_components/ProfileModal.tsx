'use client'

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { LeaderTab, StudentLeader, TeacherLeader } from "../types"

type ProfileModalProps = {
  tab: LeaderTab
  leader: StudentLeader | TeacherLeader
  onClose: () => void
  classNames: {
    chip: string
    primaryButton: string
    outlineButton: string
  }
}

export function ProfileModal({ tab, leader, onClose, classNames }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    const body = document.body
    body.classList.add("modal-open")

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      body.classList.remove("modal-open")
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [mounted, onClose])

  if (!mounted || typeof document === "undefined") {
    return null
  }

  const isStudent = tab === "students"
  const student = leader as StudentLeader
  const teacher = leader as TeacherLeader

  const modalContent = (
    <div className="modal fade show d-block" role="dialog" style={{ zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content card card-surface shadow-lg">
          <div className="modal-header border-0 pb-0">
            <div>
              <h2 className="h4 fw-semibold mb-1">{leader.name}</h2>
              <div className="text-slate small">
                {isStudent ? student.classLabel ?? "Không rõ lớp" : teacher.organization ?? "Không rõ đơn vị"}
              </div>
            </div>
            <button type="button" className={`${classNames.outlineButton} btn-sm`} onClick={onClose}>
              Đóng
            </button>
          </div>
          <div className="modal-body">
            <div className="d-flex flex-wrap gap-3 mb-4">
              <div className={`${classNames.chip} text-uppercase`}>
                Hạng #{leader.rank} · Điểm {leader.score.toFixed(1)}
              </div>
              {leader.badges.map((badge) => (
                <span key={badge} className={classNames.chip}>
                  {badge}
                </span>
              ))}
            </div>

            {isStudent ? (
              <>
                <div className="row g-3 mb-4">
                  <ProfileStat label="Số đề đã thi" value={student.examsTaken.toLocaleString("vi-VN")} />
                  <ProfileStat label="Điểm trung bình" value={student.avgScore.toFixed(1)} />
                  <ProfileStat label="Tỉ lệ đỗ" value={`${student.passRate}%`} />
                  <ProfileStat label="Chuỗi ngày học" value={`${student.streakDays} ngày`} />
                </div>

                <h3 className="h6 text-uppercase text-slate fw-semibold mb-2">Lịch sử thi gần đây</h3>
                <div className="d-grid gap-2">
                  {student.history.map((entry) => (
                    <div key={entry.id} className="card border border-soft px-3 py-2">
                      <div className="d-flex justify-content-between small fw-semibold">
                        <span>{entry.examTitle}</span>
                        <span>{entry.date}</span>
                      </div>
                      <div className="d-flex justify-content-between text-slate small">
                        <span>
                          Điểm {entry.score} · {entry.status === "passed" ? "Đã vượt qua" : "Chưa đạt"}
                        </span>
                        <a className="text-decoration-none" href={`/exams/${entry.id}`}>
                          Xem đề
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="row g-3 mb-4">
                  <ProfileStat label="Số đề đã tạo" value={teacher.examsCreated.toLocaleString("vi-VN")} />
                  <ProfileStat label="Lượt thi" value={teacher.totalTakers.toLocaleString("vi-VN")} />
                  <ProfileStat label="Đánh giá TB" value={teacher.avgRating.toFixed(1)} />
                </div>

                <h3 className="h6 text-uppercase text-slate fw-semibold mb-2">Đề đã xuất bản</h3>
                <div className="d-grid gap-2">
                  {teacher.portfolio.map((entry) => (
                    <div key={entry.id} className="card border border-soft px-3 py-2">
                      <div className="d-flex justify-content-between small fw-semibold">
                        <span>{entry.examTitle}</span>
                        <span>{entry.updatedAt}</span>
                      </div>
                      <div className="d-flex justify-content-between text-slate small">
                        <span>{entry.takers.toLocaleString("vi-VN")} lượt thi</span>
                        <a className="text-decoration-none" href={`/exams/${entry.id}`}>
                          Xem đề
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-0 pt-0">
            <a
              href={`/profile/${leader.id}`}
              className={`${classNames.primaryButton} d-inline-flex align-items-center gap-2`}
            >
              Mở hồ sơ chi tiết
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }} onClick={onClose} />
      {modalContent}
    </>,
    document.body
  )
}

type ProfileStatProps = {
  label: string
  value: string
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="col-6 col-md-3">
      <div className="card card-surface text-center py-3">
        <div className="text-slate small text-uppercase fw-semibold">{label}</div>
        <div className="fs-5 fw-bold">{value}</div>
      </div>
    </div>
  )
}
