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
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"

export type Difficulty = "easy" | "medium" | "hard"
export type ExamType = "THPT" | "Đại học" | "Công chức" | "Chứng chỉ"

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
  const router = useRouter()
  const [isBrowser, setIsBrowser] = useState(false)
  const [transitionRect, setTransitionRect] = useState<Rect | null>(null)
  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [isTransitionActive, setIsTransitionActive] = useState(false)
  const [isTransitionExpanded, setIsTransitionExpanded] = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(false)

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  useEffect(() => {
    if (!isBrowser) return

    document.body.classList.toggle("modal-open", isTransitionActive)

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isBrowser, isTransitionActive])

  const handleStartExam = useCallback(() => {
    const href = `/exams/${exam.id}`
    if (isBrowser) {
      router.push(href)
      return
    }

    if (typeof window !== "undefined") {
      window.location.href = href
    }
  }, [exam.id, isBrowser, router])

  const beginModalOpen = () => {
    if (isTransitionActive) {
      return
    }

    if (!isBrowser) {
      handleStartExam()
      return
    }

    const rect = cardRef.current?.getBoundingClientRect()

    if (!rect) {
      handleStartExam()
      return
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = Math.min(viewportWidth - 32, 960)
    const height = Math.min(viewportHeight - 32, 640)
    const top = Math.max((viewportHeight - height) / 2, 16)
    const left = Math.max((viewportWidth - width) / 2, 16)

    setTransitionRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
    setTargetRect({ top, left, width, height })
    setIsTransitionExpanded(false)
    setIsTransitionActive(true)
    setShouldNavigate(true)

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

    setIsTransitionActive(false)
    setIsTransitionExpanded(false)
    setTransitionRect(null)
    setTargetRect(null)
    if (shouldNavigate) {
      setShouldNavigate(false)
      handleStartExam()
    }
  }

  useEffect(() => {
    if (!shouldNavigate) return
    if (isTransitionActive || isTransitionExpanded) return

    setShouldNavigate(false)
    handleStartExam()
  }, [handleStartExam, isTransitionActive, isTransitionExpanded, shouldNavigate])

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
        pointerEvents: "none",
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
        <span className="badge bg-light text-slate border">Người tạo: {exam.creator}</span>
        <span className="badge bg-light text-slate border">
          Cập nhật: {dateFormatter.format(new Date(exam.updatedAt))}
        </span>
      </div>
    </div>
  )

  return (
    <>
      <div
        className={`exam-card card card-surface shadow-sm h-100 ${difficultyCardClasses[
          exam.difficulty
        ]}`}
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        style={
          {
            "--exam-outline": difficultyOutlineColors[exam.difficulty],
            "--exam-outline-soft": difficultyOutlineSoftColors[exam.difficulty],
          } as CSSProperties
        }
      >
        {renderCardSummary()}
      </div>

      {isTransitionActive && transitionStyle && isBrowser
        ? createPortal(
            <>
              <div
                className={`modal-backdrop fade ${isTransitionExpanded ? "show" : ""}`}
                style={{ zIndex: 1055, transition: "opacity 320ms ease" }}
              />
              <div
                className={`exam-card card card-surface shadow-sm ${difficultyCardClasses[exam.difficulty]}`}
                style={transitionStyle}
                onTransitionEnd={handleTransitionEnd}
                aria-hidden
              >
                {renderCardSummary()}
              </div>
            </>,
            document.body
          )
        : null}
    </>
  )
}
