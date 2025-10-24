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
import { dispatchScrollbarCompensationCheck } from "@/components/scrollbar/ScrollbarCompensationManager"

export type Difficulty = "easy" | "medium" | "hard"
export type ExamType = "THPT" | "Đại học" | "Công chức" | "Chứng chỉ"

type ScoreDistributionBucket = {
  range: string
  percent: number
}

type ExamActivityEntry = {
  label: string
  timestamp: string
}

type ExamFeedback = {
  rating: number
  totalReviews: number
  highlight: string
  comments: ExamFeedbackComment[]
}

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
  passScore: number
  certificateEnabled: boolean
  timeLimit: number
  allowPause: boolean
  uniqueCandidates: number
  scoreDistribution: ScoreDistributionBucket[]
  preExamNote: string
  postExamNote: string
  sampleQuestions: string[]
  activityHistory: ExamActivityEntry[]
  feedback: ExamFeedback
}

type ExamFeedbackComment = {
  id: string
  name: string
  avatarInitials: string
  avatarColor: string
  rating: number
  message: string
  timestamp: string
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

const scoreBarColors = ["#6366f1", "#38bdf8", "#22c55e", "#f97316", "#facc15", "#ef4444"]
const SCORE_BAR_MAX_HEIGHT = 160

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
  const [isClosing, setIsClosing] = useState(false)

  const isCardActive = isTransitionActive || isModalPinned

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const domRectToDocumentRect = useCallback((domRect: DOMRect): Rect => {
    if (typeof window === "undefined") {
      return {
        top: domRect.top,
        left: domRect.left,
        width: domRect.width,
        height: domRect.height,
      }
    }

    return {
      top: domRect.top + window.scrollY,
      left: domRect.left + window.scrollX,
      width: domRect.width,
      height: domRect.height,
    }
  }, [])

  const viewportRectToDocumentRect = useCallback((rect: Rect): Rect => {
    if (typeof window === "undefined") {
      return rect
    }

    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    }
  }, [])

  const applyScrollLock = useCallback(
    (lock: boolean) => {
      if (!isBrowser) {
        return
      }

      const body = document.body
      const rootElement = document.documentElement
      if (lock) {
        const scrollbarWidth = Math.max(window.innerWidth - rootElement.clientWidth, 0)

        const previousRootCompensation =
          rootElement.style.getPropertyValue("--scrollbar-compensation")
        const previousBodyCompensation =
          body.style.getPropertyValue("--scrollbar-compensation")

        body.dataset.prevScrollbarCompensationRoot =
          previousRootCompensation || "__EMPTY__"
        body.dataset.prevScrollbarCompensationBody =
          previousBodyCompensation || "__EMPTY__"

        if (scrollbarWidth > 0) {
          const compensation = `${scrollbarWidth}px`
          rootElement.style.setProperty("--scrollbar-compensation", compensation)
          body.style.setProperty("--scrollbar-compensation", compensation)
        } else {
          rootElement.style.removeProperty("--scrollbar-compensation")
          body.style.removeProperty("--scrollbar-compensation")
        }

        body.classList.add("modal-open")
      } else {
        body.classList.remove("modal-open")

        const prevRoot = body.dataset.prevScrollbarCompensationRoot
        const prevBody = body.dataset.prevScrollbarCompensationBody

        if (prevRoot !== undefined) {
          if (prevRoot === "__EMPTY__") {
            rootElement.style.removeProperty("--scrollbar-compensation")
          } else {
            rootElement.style.setProperty("--scrollbar-compensation", prevRoot)
          }
          delete body.dataset.prevScrollbarCompensationRoot
        }

        if (prevBody !== undefined) {
          if (prevBody === "__EMPTY__") {
            body.style.removeProperty("--scrollbar-compensation")
          } else {
            body.style.setProperty("--scrollbar-compensation", prevBody)
          }
          delete body.dataset.prevScrollbarCompensationBody
        }

        dispatchScrollbarCompensationCheck()
      }
    },
    [isBrowser]
  )

  useEffect(() => {
    applyScrollLock(isTransitionActive || isModalPinned)

    return () => {
      applyScrollLock(false)
    }
  }, [applyScrollLock, isModalPinned, isTransitionActive])

  const calculateTargetRect = useCallback((): Rect | null => {
    if (typeof window === "undefined") {
      return null
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = viewportWidth < 480 ? 16 : 32
    const maxWidth = viewportWidth >= 1440 ? 1120 : viewportWidth >= 1024 ? 1040 : 960
    const maxHeight = viewportHeight >= 900 ? 720 : 640
    const width = Math.min(viewportWidth - margin * 2, maxWidth)
    const height = Math.min(viewportHeight - margin * 2, maxHeight)
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
        setTargetRect(viewportRectToDocumentRect(nextTarget))
      }
      if (isTransitionActive && !isModalPinned) {
        const nextRect = cardRef.current?.getBoundingClientRect()
        if (nextRect) {
          setTransitionRect(domRectToDocumentRect(nextRect))
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
  }, [calculateTargetRect, domRectToDocumentRect, isBrowser, isModalPinned, isTransitionActive, viewportRectToDocumentRect])

  const closeModal = useCallback(() => {
    if (!isBrowser) {
      return
    }

    if (!isModalPinned) {
      return
    }

    const originRect = cardRef.current?.getBoundingClientRect()

    if (originRect) {
      setTransitionRect(domRectToDocumentRect(originRect))
      setIsTransitionActive(true)
      requestAnimationFrame(() => setIsTransitionExpanded(false))
    } else {
      setIsTransitionActive(false)
      setIsTransitionExpanded(false)
      setTransitionRect(null)
      setTargetRect(null)
      setIsClosing(false)
    }

    setIsClosing(true)
    setShowDetails(false)
    setIsModalPinned(false)
  }, [domRectToDocumentRect, isBrowser, isModalPinned])

  useEffect(() => {
    if (!isBrowser || !isModalPinned) {
      return
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeModal, isBrowser, isModalPinned])

  const beginModalOpen = () => {
    if (isTransitionActive || !isBrowser) {
      return
    }

    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }

    applyScrollLock(true)

    // Force a reflow so measurements include scroll lock adjustments
    void cardRef.current?.offsetHeight

    const lockedRect = cardRef.current?.getBoundingClientRect()
    const startRect = lockedRect ?? rect
    const startDocumentRect = domRectToDocumentRect(startRect)

    const target = calculateTargetRect()
    if (!target) {
      applyScrollLock(false)
      return
    }

    setTransitionRect(startDocumentRect)
    setTargetRect(viewportRectToDocumentRect(target))
    setIsTransitionExpanded(false)
    setIsTransitionActive(true)
    setIsModalPinned(false)
    setShowDetails(false)
    setIsClosing(false)

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
    if (event.target !== event.currentTarget) return

    if (isTransitionExpanded) {
      setIsModalPinned(true)
      setIsTransitionActive(false)
      setShowDetails(true)
      return
    }

    setIsTransitionActive(false)
    setTransitionRect(null)
    setTargetRect(null)
    setIsClosing(false)
  }

  const currentTransitionRect =
    isTransitionExpanded && targetRect ? targetRect : transitionRect

  const transitionDuration = isClosing ? 220 : 320
  const boxShadowDuration = Math.max(transitionDuration - 40, 140)
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0
  const transitionStyle: CSSProperties | undefined = currentTransitionRect
    ? {
      position: "fixed",
      top: `${currentTransitionRect.top - scrollY + 6}px`,
      left: `${currentTransitionRect.left - scrollX}px`,
      width: `${currentTransitionRect.width}px`,
      height: `${currentTransitionRect.height}px`,
      borderRadius: "var(--bs-border-radius)",
      transition: [
        `top ${transitionDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
        `left ${transitionDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
        `width ${transitionDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
        `height ${transitionDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
        `border-radius ${transitionDuration}ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
        `box-shadow ${boxShadowDuration}ms ease`,
      ].join(", "),
      boxShadow: isTransitionExpanded
        ? "0 1.5rem 4rem rgba(15, 23, 42, 0.35)"
        : "0 0.75rem 2rem rgba(15, 23, 42, 0.2)",
      overflow: "hidden",
      zIndex: 1060,
      background: "var(--bs-body-bg, #fff)",
      pointerEvents: isModalPinned ? "auto" : "none",
      cursor: isModalPinned ? "default" : "auto",
      display: "flex",
      flexDirection: "column",
      "--exam-outline": difficultyOutlineColors[exam.difficulty],
      "--exam-outline-soft": difficultyOutlineSoftColors[exam.difficulty],
    }
    : undefined

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`exam-feedback-comments__star${index < Math.round(rating) ? " is-active" : ""}`}
        aria-hidden="true"
      >
        ★
      </span>
    ))

  const renderDetailContent = () => {
    return (
      <div className={`exam-card-details pt-3 ${showDetails ? "is-visible" : ""}`}>
        <div className="row g-3 small text-slate">
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Loại đề
            </span>
            <span className="text-body fw-semibold d-block">{exam.type}</span>
            <span className="text-slate">Nhóm kỳ thi tương ứng.</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Người tạo
            </span>
            <span className="text-body fw-semibold d-block">{exam.creator}</span>
            <span className="text-slate">Đơn vị chịu trách nhiệm nội dung.</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Điểm đạt
            </span>
            <div className="d-flex flex-wrap align-items-center gap-2 text-body">
              <span className="badge bg-light text-primary border border-primary">
                {exam.passScore.toFixed(1)} / 10
              </span>
              <span className="text-slate">Ngưỡng tối thiểu để tính ‘đỗ’.</span>
            </div>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Chứng chỉ
            </span>
            <div className="d-flex flex-wrap align-items-center gap-2 text-body">
              <span
                className={`badge bg-light border ${exam.certificateEnabled
                    ? "text-success border-success"
                    : "text-slate border-secondary"
                  }`}
              >
                {exam.certificateEnabled ? "Bật" : "Tắt"}
              </span>
              <span className="text-slate">Bật nếu muốn phát chứng chỉ sau khi đỗ.</span>
            </div>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Giới hạn thời gian
            </span>
            <div className="text-body fw-medium">
              {exam.timeLimit === 0 ? "Không giới hạn" : `${exam.timeLimit} phút`}
            </div>
            <span className="text-slate">0 = không giới hạn</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Cho phép tạm dừng
            </span>
            <span className="text-body fw-medium">{exam.allowPause ? "Có" : "Không"}</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Điểm trung bình
            </span>
            <span className="text-body fw-semibold d-block">{exam.avgScore.toFixed(1)} / 10</span>
            <span className="text-slate">Theo thống kê từ các lượt làm.</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Lượt làm
            </span>
            <span className="text-body fw-semibold d-block">
              {exam.attempts.toLocaleString("vi-VN")}
            </span>
            <span className="text-slate">Tổng số lượt đã hoàn thành đề thi.</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Số thí sinh duy nhất
            </span>
            <span className="text-body fw-semibold d-block">
              {exam.uniqueCandidates.toLocaleString("vi-VN")}
            </span>
            <span className="text-slate">Mỗi thí sinh chỉ tính một lần duy nhất.</span>
          </div>
          <div className="col-sm-6">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
              Cập nhật
            </span>
            <span className="text-body fw-semibold d-block">
              {dateFormatter.format(new Date(exam.updatedAt))}
            </span>
            <span className="text-slate">Thời gian chỉnh sửa gần nhất.</span>
          </div>
        </div>

        {exam.scoreDistribution.length > 0 ? (
          <div className="mt-3">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-2 small">
              Biểu đồ phân bố điểm
            </span>
            <div className="exam-score-chart__wrapper">
              <div
                className="exam-score-chart"
                role="img"
                aria-label="Biểu đồ phân bố điểm theo phần trăm"
              >
                {exam.scoreDistribution.map((bucket, index) => {
                  const barHeight = Math.max(
                    12,
                    Math.round((bucket.percent / 100) * SCORE_BAR_MAX_HEIGHT)
                  )

                  return (
                    <div key={bucket.range} className="exam-score-chart__item">
                      <div
                        className="exam-score-chart__bar"
                        style={{
                          height: `${barHeight}px`,
                          background: scoreBarColors[index % scoreBarColors.length],
                        }}
                        aria-hidden="true"
                      />
                      <span className="exam-score-chart__percent">{bucket.percent}%</span>
                      <span className="exam-score-chart__range">{bucket.range}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-3 small text-slate">
          <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
            Hướng dẫn trước khi thi
          </span>
          <p className="mb-2 text-body">{exam.preExamNote}</p>
          <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1">
            Ghi chú sau khi thi
          </span>
          <p className="mb-0 text-body">{exam.postExamNote}</p>
        </div>

        {exam.sampleQuestions.length > 0 ? (
          <div className="mt-3">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1 small">
              Ví dụ một vài câu hỏi
            </span>
            <ul className="list-unstyled mb-0 small text-slate">
              {exam.sampleQuestions.map((question) => (
                <li key={question} className="d-flex gap-2 align-items-start">
                  <span className="text-body-secondary">•</span>
                  <span className="text-body">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {exam.activityHistory.length > 0 ? (
          <div className="mt-3">
            <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1 small">
              Lịch sử hoạt động
            </span>
            <ul className="list-unstyled mb-0 small text-slate">
              {exam.activityHistory.map((entry, index) => (
                <li key={`${entry.label}-${index}`} className="d-flex flex-column flex-sm-row gap-1">
                  <span className="text-body fw-semibold">{entry.label}</span>
                  <span className="text-body-secondary">· {entry.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-3">
          <span className="text-uppercase text-body-secondary fw-semibold d-block mb-1 small">
            Bình luận, đánh giá đề
          </span>
          <div className="d-flex flex-wrap align-items-center gap-2 small">
            <span className="badge bg-light text-warning border border-warning">
              {exam.feedback.rating.toFixed(1)} / 5
            </span>
            <span className="text-body">
              ({exam.feedback.totalReviews.toLocaleString("vi-VN")} đánh giá)
            </span>
            <span className="text-slate">{exam.feedback.highlight}</span>
          </div>
        </div>

        {exam.feedback.comments.length > 0 ? (
          <div className="exam-feedback-comments mt-3">
            {exam.feedback.comments.map((comment) => (
              <article key={comment.id} className="exam-feedback-comments__item">
                <div
                  className="exam-feedback-comments__avatar"
                  style={{ background: comment.avatarColor }}
                  aria-hidden="true"
                >
                  {comment.avatarInitials}
                </div>
                <div className="exam-feedback-comments__content">
                  <div className="exam-feedback-comments__header">
                    <span className="exam-feedback-comments__name">{comment.name}</span>
                    <span className="exam-feedback-comments__rating" aria-label="Đánh giá sao">
                      {renderStars(comment.rating)}
                    </span>
                  </div>
                  <p className="exam-feedback-comments__message mb-1">{comment.message}</p>
                  <span className="exam-feedback-comments__time">{comment.timestamp}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const renderCardSummary = (withDetails = false, showCta = false) => {
    const cardBodyClassName = `card-body d-flex flex-column ${withDetails ? "exam-card-body--expanded" : ""
      }`
    const cardBodyStyle: CSSProperties | undefined = withDetails ? { height: "100%" } : undefined
    const summaryMarginClass = withDetails ? "mb-0" : "mb-3"

    return (
      <div className={cardBodyClassName} style={cardBodyStyle}>
        <div
          className={`exam-card-summary ${summaryMarginClass} ${withDetails ? "exam-card-summary--expanded" : ""
            }`}
        >
          <div className={`exam-card-summary__heading ${withDetails ? "exam-card-summary__heading--expanded" : ""}`}>
            <div className="exam-card-summary__title">
              <h3 className="h5 fw-semibold mb-1">{exam.title}</h3>
              <div className="exam-card-summary__meta text-muted small">
                {exam.subject} · {exam.duration} phút ·{" "}
                <span className={difficultyBadgeClasses[exam.difficulty]}>
                  {difficultyLabels[exam.difficulty]}
                </span>
              </div>
            </div>
            {withDetails && showCta ? (
              <button type="button" className="btn btn-honey exam-card-summary__cta">
                Thi Ngay
              </button>
            ) : null}
          </div>
          {withDetails ? null : (
            <div className="exam-card-summary__badges d-flex flex-wrap gap-2">
              <span className="badge bg-light text-slate border">Loại: {exam.type}</span>
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
          )}
        </div>
        {withDetails ? (
          <div className="exam-card-details-scroll">{renderDetailContent()}</div>
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
              onClick={closeModal}
            />
            <div
              className={overlayCardClassName}
              style={transitionStyle}
              onTransitionEnd={handleTransitionEnd}
              aria-hidden
            >
              {renderCardSummary(true, isTransitionExpanded)}
            </div>
          </>,
          document.body
        )
        : null}
    </>
  )
}
