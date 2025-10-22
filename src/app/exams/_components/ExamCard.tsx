'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type TransitionEvent,
} from "react"
import { createPortal } from "react-dom"

export type Difficulty = "easy" | "medium" | "hard"
export type ExamType =
  | "THPT"
  | "Đại học"
  | "Công chức"
  | "Chứng chỉ"

export type Exam = {
  id: string
  title: string
  subject: string
  duration: number
  difficulty: Difficulty
  attempts: number
  avgScore: number
  creator: string
  type: ExamType
  updatedAt: string
  flags: {
    topRated: boolean
    mostTaken: boolean
    recent: boolean
  }
}

type ExamCardProps = {
  exam: Exam
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

const difficultyBadgeClasses: Record<Difficulty, string> = {
  easy: "badge bg-light text-success border border-success",
  medium: "badge bg-light text-warning border border-warning",
  hard: "badge bg-light text-danger border border-danger",
}

const difficultyCardClasses: Record<Difficulty, string> = {
  easy: "border border-success-subtle border-2",
  medium: "border border-warning-subtle border-2",
  hard: "border border-danger-subtle border-2",
}

const difficultyOutlineColors: Record<Difficulty, string> = {
  easy: "rgba(34, 197, 94, 0.8)",
  medium: "rgba(250, 204, 21, 0.85)",
  hard: "rgba(248, 113, 113, 0.85)",
}

const difficultyOutlineSoftColors: Record<Difficulty, string> = {
  easy: "rgba(34, 197, 94, 0.28)",
  medium: "rgba(250, 204, 21, 0.25)",
  hard: "rgba(248, 113, 113, 0.28)",
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export const ExamCard: FC<ExamCardProps> = ({ exam }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isBrowser, setIsBrowser] = useState(false)
  const [transitionRect, setTransitionRect] = useState<Rect | null>(null)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [isTransitionActive, setIsTransitionActive] = useState(false)
  const [isTransitionExpanded, setIsTransitionExpanded] = useState(false)
  const [isModalPinned, setIsModalPinned] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isCardActive = isTransitionActive || isModalPinned

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  useEffect(() => {
    if (!isBrowser) return

    const shouldLockScroll = isTransitionActive || isModalPinned
    document.body.classList.toggle("modal-open", shouldLockScroll)

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isBrowser, isModalPinned, isTransitionActive])

  const calculateTargetRect = useCallback((): Rect | null => {
    if (typeof window === "undefined") {
      return null
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = viewportWidth < 480 ? 16 : 32
    const width = Math.min(viewportWidth - margin * 2, 960)
    const height = Math.min(viewportHeight - margin * 2, 640)
    const extraLeftOffset =
      viewportWidth > 1440
        ? (viewportWidth - width) * 0.04
        : viewportWidth > 1024
        ? (viewportWidth - width) * 0.02
        : 0
    const top = Math.max((viewportHeight - height) / 2, margin)
    const left = Math.max((viewportWidth - width) / 2 - extraLeftOffset, margin)

    return { top, left, width, height }
  }, [])

  useEffect(() => {
    if (!isBrowser) return
    if (!isTransitionActive && !isModalPinned) return

    const handleResize = () => {
      const nextTarget = calculateTargetRect()
      if (nextTarget) {
        setTargetRect(nextTarget)
      }
      if (isTransitionActive && !isModalPinned) {
        const nextRect = cardRef.current?.getBoundingClientRect()
        if (nextRect) {
          setTransitionRect({
            top: nextRect.top,
            left: nextRect.left,
            width: nextRect.width,
            height: nextRect.height,
          })
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [calculateTargetRect, isBrowser, isModalPinned, isTransitionActive])

  const beginModalOpen = () => {
    if (isTransitionActive) {
      return
    }

    if (!isBrowser) {
      return
    }

    const rect = cardRef.current?.getBoundingClientRect()

    if (!rect) {
      return
    }

    const target = calculateTargetRect()
    if (!target) {
      return
    }

    setTransitionRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
    setTargetRect(target)
    setIsTransitionExpanded(false)
    setIsTransitionActive(true)
    setIsModalPinned(false)
    setShowDetails(false)

    requestAnimationFrame(() => setIsTransitionExpanded(true))
  }

  const handleCardClick = () => {
    beginModalOpen()
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      beginModalOpen()
    }
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (!isTransitionExpanded) return
    if (event.target !== event.currentTarget) return

    setIsModalPinned(true)
    setIsTransitionActive(false)
    setShowDetails(true)
  }

  const currentTransitionRect =
    isTransitionExpanded && targetRect ? targetRect : transitionRect

  const transitionStyle: CSSProperties | undefined = currentTransitionRect
    ? {
        position: "fixed",
        top: `${currentTransitionRect.top}px`,
        left: `${currentTransitionRect.left}px`,
        width: `${currentTransitionRect.width}px`,
        height: `${currentTransitionRect.height}px`,
        borderRadius: isTransitionExpanded ? "1rem" : "0.95rem",
        transition:
          "top 320ms cubic-bezier(0.25, 0.8, 0.25, 1), left 320ms cubic-bezier(0.25, 0.8, 0.25, 1), width 320ms cubic-bezier(0.25, 0.8, 0.25, 1), height 320ms cubic-bezier(0.25, 0.8, 0.25, 1), border-radius 320ms cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 320ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        boxShadow: isTransitionExpanded
          ? "0 1.5rem 4rem rgba(15, 23, 42, 0.35)"
          : "0 0.75rem 2rem rgba(15, 23, 42, 0.2)",
        overflow: "hidden",
        zIndex: 1060,
        background: "var(--bs-body-bg, #fff)",
        pointerEvents: isModalPinned ? "auto" : "none",
        cursor: isModalPinned ? "default" : "auto",
        "--exam-outline": difficultyOutlineColors[exam.difficulty],
        "--exam-outline-soft": difficultyOutlineSoftColors[exam.difficulty],
      }
    : undefined

  const renderCardSummary = () => (
    <div className="card-body d-flex flex-column">
      <div className="mb-3">
        <h3 className="h5 fw-semibold mb-2">{exam.title}</h3>
        <div className="text-slate small">
          {exam.subject} · {exam.duration} phút ·{" "}
          <span className={difficultyBadgeClasses[exam.difficulty]}>
            {difficultyLabels[exam.difficulty]}
          </span>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <span className="badge bg-light text-slate border">
          Lượt thi: {exam.attempts.toLocaleString("vi-VN")}
        </span>
        <span className="badge bg-light text-slate border">
          Điểm TB: {exam.avgScore.toFixed(1)}
        </span>
        <span className="badge bg-light text-slate border">
          Người tạo: {exam.creator}
        </span>
        <span className="badge bg-light text-slate border">
          Cập nhật: {dateFormatter.format(new Date(exam.updatedAt))}
        </span>
      </div>
    </div>
  )

  const renderExpandedDetails = () => {
    const highlightBadges: string[] = []
    if (exam.flags.topRated) {
      highlightBadges.push("Được đánh giá cao")
    }
    if (exam.flags.mostTaken) {
      highlightBadges.push("Nhiều lượt tham gia")
    }
    if (exam.flags.recent) {
      highlightBadges.push("Vừa cập nhật")
    }

    return (
      <div
        className={`exam-card-details card-body border-top pt-3 ${showDetails ? "is-visible" : ""}`}
      >
        <div className="row g-3 small text-slate">
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Loại đề
            </span>
            <span className="fw-medium text-body">{exam.type}</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Mức độ
            </span>
            <span className="fw-medium text-body">{difficultyLabels[exam.difficulty]}</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Lượt thi
            </span>
            <span className="fw-medium text-body">{exam.attempts.toLocaleString("vi-VN")}</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Điểm trung bình
            </span>
            <span className="fw-medium text-body">{exam.avgScore.toFixed(1)} / 10</span>
          </div>
        </div>

        {highlightBadges.length > 0 ? (
          <div className="mt-3 d-flex flex-wrap gap-2">
            {highlightBadges.map((label) => (
              <span key={label} className="badge bg-light text-success border border-success">
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const baseCardClassName = `exam-card card card-surface shadow-sm h-100 ${difficultyCardClasses[
    exam.difficulty
  ]} ${isCardActive ? "exam-card--active" : ""}`

  const overlayCardClassName = `exam-card card card-surface shadow-sm ${difficultyCardClasses[
    exam.difficulty
  ]} ${isCardActive ? "exam-card--active" : ""}`

  return (
    <>
      <div
        className={baseCardClassName}
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        aria-pressed={isCardActive}
        style={
          {
            "--exam-outline": difficultyOutlineColors[exam.difficulty],
            "--exam-outline-soft": difficultyOutlineSoftColors[exam.difficulty],
            cursor: isModalPinned ? "default" : undefined,
          } as CSSProperties
        }
      >
        {renderCardSummary()}
      </div>

      {isCardActive && transitionStyle && isBrowser
        ? createPortal(
            <>
              <div
                className={`modal-backdrop fade ${isTransitionExpanded ? "show" : ""}`}
                style={{ zIndex: 1055, transition: "opacity 320ms ease" }}
              />
              <div
                className={overlayCardClassName}
                style={transitionStyle}
                onTransitionEnd={handleTransitionEnd}
                aria-hidden
              >
                {renderCardSummary()}
                {renderExpandedDetails()}
              </div>
            </>,
            document.body
          )
        : null}
    </>
  )
}
