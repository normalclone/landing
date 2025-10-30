'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RankRow } from "./_components/RankRow"
import { ProfileModal } from "./_components/ProfileModal"
import type {
  LeaderTab,
  LeaderCategory,
  TimeframeOption,
  StudentLeader,
  TeacherLeader,
  StudentSortOption,
  TeacherSortOption,
} from "./types"

// ===== Constants =====

const CLASS = {
  primaryButton: "btn btn-indigo",
  outlineButton: "btn btn-outline-secondary",
  chip: "badge bg-light text-slate border",
  sidebarCard: "card card-surface shadow-sm",
}

const PAGE_SIZE = 100

type StudentBoardConfig = {
  id: string
  label: string
  description: string
  category: LeaderCategory
  timeframe: TimeframeOption
  sortBy: StudentSortOption
}

type TeacherBoardConfig = {
  id: string
  label: string
  description: string
  category: LeaderCategory
  timeframe: TimeframeOption
  sortBy: TeacherSortOption
}

const STUDENT_BOARDS: StudentBoardConfig[] = [
  {
    id: "students-thpt-week",
    label: "THPT · Tuần này",
    description: "Top học viên luyện thi THPT theo điểm xếp hạng trong tuần.",
    category: "THPT",
    timeframe: "week",
    sortBy: "score",
  },
  {
    id: "students-thpt-month",
    label: "THPT · Tháng này",
    description: "Vinh danh chuỗi ngày học dài nhất trong tháng.",
    category: "THPT",
    timeframe: "month",
    sortBy: "streakDays",
  },
  {
    id: "students-uni-all",
    label: "Đại học · Toàn thời gian",
    description: "Học viên Đại học có điểm trung bình cao nhất.",
    category: "Đại học",
    timeframe: "all",
    sortBy: "avgScore",
  },
  {
    id: "students-certificate-month",
    label: "Chứng chỉ · Tháng này",
    description: "Tỉ lệ đỗ chứng chỉ nổi bật trong tháng.",
    category: "Chứng chỉ",
    timeframe: "month",
    sortBy: "passRate",
  },
]

const TEACHER_BOARDS: TeacherBoardConfig[] = [
  {
    id: "teachers-uni-week",
    label: "Giáo viên Đại học · Tuần này",
    description: "Điểm xếp hạng tổng hợp của giảng viên trong tuần.",
    category: "Đại học",
    timeframe: "week",
    sortBy: "score",
  },
  {
    id: "teachers-public-month",
    label: "Giáo viên Công chức · Tháng này",
    description: "Số lượt thi cao nhất dành cho nhóm công chức.",
    category: "Công chức",
    timeframe: "month",
    sortBy: "totalTakers",
  },
  {
    id: "teachers-certificate-all",
    label: "Giáo viên Chứng chỉ · Toàn thời gian",
    description: "Giáo viên chứng chỉ có đánh giá trung bình cao nhất.",
    category: "Chứng chỉ",
    timeframe: "all",
    sortBy: "avgRating",
  },
  {
    id: "teachers-thpt-month",
    label: "Giáo viên THPT · Tháng này",
    description: "Giáo viên THPT tạo nhiều đề mới nhất trong tháng.",
    category: "THPT",
    timeframe: "month",
    sortBy: "examsCreated",
  },
]

type StudentSortConfig = {
  label: string
  getValue: (leader: StudentLeader) => number
  format: (leader: StudentLeader) => string
  helper?: (leader: StudentLeader) => string
}

type TeacherSortConfig = {
  label: string
  getValue: (leader: TeacherLeader) => number
  format: (leader: TeacherLeader) => string
  helper?: (leader: TeacherLeader) => string
}

const STUDENT_SORT_CONFIG: Record<StudentSortOption, StudentSortConfig> = {
  score: {
    label: "Điểm xếp hạng",
    getValue: (leader) => leader.score,
    format: (leader) => leader.score.toFixed(1),
    helper: (leader) => `Điểm tổng hợp từ ${leader.examsTaken} đề`,
  },
  avgScore: {
    label: "Điểm trung bình",
    getValue: (leader) => leader.avgScore,
    format: (leader) => leader.avgScore.toFixed(1),
    helper: () => "Trung bình dựa trên toàn bộ đề đã thi",
  },
  passRate: {
    label: "Tỉ lệ đỗ",
    getValue: (leader) => leader.passRate,
    format: (leader) => `${leader.passRate}%`,
    helper: (leader) => `${leader.examsTaken} đề đã tham gia`,
  },
  examsTaken: {
    label: "Số đề đã thi",
    getValue: (leader) => leader.examsTaken,
    format: (leader) => leader.examsTaken.toLocaleString("vi-VN"),
    helper: (leader) => `Chuỗi luyện tập ${leader.streakDays} ngày`,
  },
  streakDays: {
    label: "Chuỗi ngày học",
    getValue: (leader) => leader.streakDays,
    format: (leader) => `${leader.streakDays} ngày`,
    helper: () => "Số ngày học liên tiếp gần nhất",
  },
}

const TEACHER_SORT_CONFIG: Record<TeacherSortOption, TeacherSortConfig> = {
  score: {
    label: "Điểm xếp hạng",
    getValue: (leader) => leader.score,
    format: (leader) => leader.score.toFixed(1),
    helper: (leader) => `${leader.examsCreated} đề đã phát hành`,
  },
  examsCreated: {
    label: "Số đề đã tạo",
    getValue: (leader) => leader.examsCreated,
    format: (leader) => leader.examsCreated.toLocaleString("vi-VN"),
    helper: (leader) => `${leader.totalTakers.toLocaleString("vi-VN")} lượt thi`,
  },
  totalTakers: {
    label: "Số lượt thi",
    getValue: (leader) => leader.totalTakers,
    format: (leader) => leader.totalTakers.toLocaleString("vi-VN"),
    helper: (leader) => `${leader.examsCreated} đề đang hoạt động`,
  },
  avgRating: {
    label: "Đánh giá trung bình",
    getValue: (leader) => leader.avgRating,
    format: (leader) => leader.avgRating.toFixed(1),
    helper: () => "Thang điểm 5.0 từ học viên",
  },
}

type HoverInfo = {
  tab: LeaderTab
  leader: StudentLeader | TeacherLeader
  top: number
  left: number
}

type SelectedProfile = {
  tab: LeaderTab
  leader: StudentLeader | TeacherLeader
}

type GetLeaderboardParams = {
  tab: LeaderTab
  category: LeaderCategory
  timeframe: TimeframeOption
  sortBy: StudentSortOption | TeacherSortOption
  page: number
  size: number
}

const STUDENT_LEADERS: StudentLeader[] = createStudentLeaders()
const TEACHER_LEADERS: TeacherLeader[] = createTeacherLeaders()

// ===== Component =====

export default function LeaderBoardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab") === "teachers" ? "teachers" : "students"

  const [activeTab, setActiveTab] = useState<LeaderTab>(tabParam)
  const [activeBoardByTab, setActiveBoardByTab] = useState<Record<LeaderTab, string>>(() => ({
    students: STUDENT_BOARDS[0].id,
    teachers: TEACHER_BOARDS[0].id,
  }))
  const [leaders, setLeaders] = useState<Array<StudentLeader | TeacherLeader>>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null)
  const requestIdRef = useRef(0)
  const animationObserverRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  useEffect(() => {
    const boards = activeTab === "students" ? STUDENT_BOARDS : TEACHER_BOARDS
    const currentBoardId = activeBoardByTab[activeTab]
    if (!boards.some((board) => board.id === currentBoardId)) {
      setActiveBoardByTab((previous) => ({
        ...previous,
        [activeTab]: boards[0].id,
      }))
    }
  }, [activeTab, activeBoardByTab])

  const boardsForTab = activeTab === "students" ? STUDENT_BOARDS : TEACHER_BOARDS

  const activeBoard = useMemo(() => {
    const boardId = activeBoardByTab[activeTab]
    return boardsForTab.find((board) => board.id === boardId) ?? boardsForTab[0]
  }, [activeTab, activeBoardByTab, boardsForTab])

  const category = activeBoard?.category
  const timeframe = activeBoard?.timeframe
  const sortKey = (activeBoard?.sortBy ?? (activeTab === "students" ? "score" : "score")) as
    | StudentSortOption
    | TeacherSortOption

  const sortConfig = useMemo(() => {
    return activeTab === "students"
      ? STUDENT_SORT_CONFIG[sortKey as StudentSortOption]
      : TEACHER_SORT_CONFIG[sortKey as TeacherSortOption]
  }, [activeTab, sortKey])

  const activeChips = useMemo(() => {
    if (!activeBoard) {
      return []
    }
    const chips = [activeBoard.label]
    if (activeBoard.description) {
      chips.push(activeBoard.description)
    }
    return chips
  }, [activeBoard])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const animatedElements = Array.from(document.querySelectorAll<HTMLElement>("[data-animate]"))
    if (animatedElements.length === 0) {
      return
    }

    const prefersReducedMotion =
      typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null

    const show = (element: HTMLElement) => element.classList.add("is-visible")

    if ((prefersReducedMotion && prefersReducedMotion.matches) || !("IntersectionObserver" in window)) {
      animatedElements.forEach(show)
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target as HTMLElement)
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2, rootMargin: "0px 0px -12%" }
    )

    animationObserverRef.current = observer

    animatedElements.forEach((element) => {
      element.classList.remove("is-visible")
      observer.observe(element)
    })

    return () => {
      animationObserverRef.current = null
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const observer = animationObserverRef.current
    if (!observer) {
      return
    }

    const animatedElements = Array.from(document.querySelectorAll<HTMLElement>("[data-animate]:not(.is-visible)"))
    animatedElements.forEach((element) => observer.observe(element))

    return () => {
      animatedElements.forEach((element) => observer.unobserve(element))
    }
  }, [leaders, activeChips.length, hasMore, isLoading])

  const handleTabChange = useCallback(
    (tab: LeaderTab) => {
      if (tab === activeTab) {
        return
      }

      const params = new URLSearchParams()
      searchParams.forEach((value, key) => {
        if (key !== "tab") {
          params.set(key, value)
        }
      })
      params.set("tab", tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      setActiveTab(tab)
      setPage(1)
      setLeaders([])
      setHasMore(true)
      setIsLoading(true)
      setHoverInfo(null)
    },
    [activeTab, pathname, router, searchParams]
  )

  const handleBoardPick = useCallback((tab: LeaderTab, boardId: string) => {
    setActiveBoardByTab((previous) => ({
      ...previous,
      [tab]: boardId,
    }))
    if (tab !== activeTab) {
      setActiveTab(tab)
    }
    setHoverInfo(null)
    setPage(1)
  }, [activeTab])

  const renderBoardList = useCallback(
    (tab: LeaderTab) => {
      const boards = tab === "students" ? STUDENT_BOARDS : TEACHER_BOARDS
      const currentId = activeBoardByTab[tab]

      return (
        <ul className="nav nav-pills flex-column gap-2" role="tablist">
          {boards.map((board) => {
            const isActive = board.id === currentId
            const buttonClass = `nav-link w-100 text-start d-flex flex-column align-items-start ${
              isActive ? "active" : ""
            }`

            return (
              <li key={board.id} className="nav-item" role="presentation">
                <button
                  type="button"
                  className={buttonClass}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleBoardPick(tab, board.id)}
                >
                  <div className="fw-semibold">{board.label}</div>
                  <div className="small text-slate">{board.description}</div>
                </button>
              </li>
            )
          })}
        </ul>
      )
    },
    [activeBoardByTab, handleBoardPick]
  )

  const handleRowHover = useCallback(
    (leader: StudentLeader | TeacherLeader, rect: DOMRect) => {
      if (typeof window === "undefined") {
        return
      }

      const scrollX = window.scrollX
      const scrollY = window.scrollY
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 280
      const tooltipHeight = 160

      const desiredLeft = scrollX + rect.left + rect.width + 16
      const maxLeft = scrollX + viewportWidth - tooltipWidth - 16
      const left = Math.max(scrollX + 16, Math.min(desiredLeft, maxLeft))

      const desiredTop = scrollY + rect.top + rect.height / 2 - tooltipHeight / 2
      const maxTop = scrollY + viewportHeight - tooltipHeight - 16
      const top = Math.max(scrollY + 16, Math.min(desiredTop, maxTop))

      setHoverInfo({
        tab: activeTab,
        leader,
        top,
        left,
      })
    },
    [activeTab]
  )

  const handleRowLeave = useCallback(() => {
    setHoverInfo(null)
  }, [])

  const handleViewProfile = useCallback((leader: StudentLeader | TeacherLeader) => {
    setHoverInfo(null)
    setSelectedProfile({
      tab: activeTab,
      leader,
    })
  }, [activeTab])

  const handleCloseProfile = useCallback(() => {
    setSelectedProfile(null)
  }, [])

  useEffect(() => {
    if (!category || !timeframe || !sortKey) {
      return
    }

    setIsLoading(true)
    setLeaders([])
    setPage(1)
    setHasMore(true)
    setHoverInfo(null)
  }, [activeTab, category, timeframe, sortKey])

  useEffect(() => {
    if (!category || !timeframe || !sortKey) {
      return
    }

    let cancelled = false
    const requestId = ++requestIdRef.current

    const params: GetLeaderboardParams = {
      tab: activeTab,
      category,
      timeframe,
      sortBy: sortKey,
      page,
      size: PAGE_SIZE,
    }

    mockFetchLeaderboard(params)
      .then((response) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return
        }

        setTotal(response.total)
        setHasMore(page * PAGE_SIZE < response.total)
        setLeaders((previous) => (page === 1 ? response.items : [...previous, ...response.items]))
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeTab, category, timeframe, sortKey, page])

  useEffect(() => {
    if (!isMounted || !("IntersectionObserver" in window)) {
      return
    }

    if (sentinelObserverRef.current) {
      sentinelObserverRef.current.disconnect()
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry?.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true)
        setPage((previous) => previous + 1)
      }
    })

    sentinelObserverRef.current = observer
    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, isMounted])

  const rowClassNames = useMemo(
    () => ({
      chip: CLASS.chip,
      outlineButton: CLASS.outlineButton,
    }),
    []
  )

  const modalClassNames = useMemo(
    () => ({
      chip: CLASS.chip,
      primaryButton: CLASS.primaryButton,
      outlineButton: CLASS.outlineButton,
    }),
    []
  )

  if (!activeBoard || !category || !timeframe) {
    return (
      <main className="section">
        <div className="container py-5 text-center">
          <h1 className="h4">Không tìm thấy bảng xếp hạng phù hợp.</h1>
        </div>
      </main>
    )
  }

  return (
    <main>
      <section className="section pb-0 bg-surface border-bottom border-soft">
        <div data-animate className="container py-5 fade-in">
          <div className="row g-4 align-items-end">
            <div data-animate className="col-12 col-lg-9 fade-in-up">
              <h1 className="display-5 fw-black mb-2">Xếp hạng</h1>
              <p className="text-slate mb-4">
                So sánh thành tích học viên và chất lượng đóng góp của giáo viên theo tuần, tháng và toàn thời gian.
              </p>
              <div className="text-slate small">
                <div className="fw-semibold">{activeBoard.label}</div>
                <div>{activeBoard.description}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div data-animate className="container py-5 fade-in">
          <div className="row g-4">
            <aside data-animate className="col-12 col-lg-3 fade-in-up">
              <div
                data-animate
                className={`${CLASS.sidebarCard} fade-in-up`}
                style={{ position: "sticky", top: "6.5rem" }}
              >
                <div className="card-body">
                  <h2 className="h5 fw-semibold mb-3">Các bảng xếp hạng</h2>
                  <div className="nav nav-tabs nav-fill mb-3" role="tablist">
                    <button
                      id="ranking-tab-students"
                      type="button"
                      className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                      role="tab"
                      aria-controls="ranking-panel-students"
                      aria-selected={activeTab === "students"}
                      onClick={() => handleTabChange("students")}
                    >
                      Sinh viên
                    </button>
                    <button
                      id="ranking-tab-teachers"
                      type="button"
                      className={`nav-link ${activeTab === "teachers" ? "active" : ""}`}
                      role="tab"
                      aria-controls="ranking-panel-teachers"
                      aria-selected={activeTab === "teachers"}
                      onClick={() => handleTabChange("teachers")}
                    >
                      Giáo viên
                    </button>
                  </div>
                  <div className="tab-content">
                    <div
                      className={`tab-pane fade ${activeTab === "students" ? "show active" : ""}`}
                      id="ranking-panel-students"
                      role="tabpanel"
                      aria-labelledby="ranking-tab-students"
                    >
                      {renderBoardList("students")}
                    </div>
                    <div
                      className={`tab-pane fade ${activeTab === "teachers" ? "show active" : ""}`}
                      id="ranking-panel-teachers"
                      role="tabpanel"
                      aria-labelledby="ranking-tab-teachers"
                    >
                      {renderBoardList("teachers")}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div data-animate className="col-12 col-lg-9 fade-in-up">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="fw-semibold pt-4">
                  {total > 0 ? `${total.toLocaleString("vi-VN")} hồ sơ nổi bật` : "Chưa có dữ liệu phù hợp"}
                </div>
                <div className="text-slate small text-end">
                  <div className="fw-semibold">{activeBoard.label}</div>
                  <div>{activeBoard.description}</div>
                  <div>Sắp xếp theo: {sortConfig.label}</div>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {activeChips.map((chip) => (
                    <span key={chip} className={CLASS.chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <div className="d-grid gap-3">
                {leaders.map((leader) => {
                  const metric =
                    activeTab === "students"
                      ? {
                          label: sortConfig.label,
                          valueText: (sortConfig as StudentSortConfig).format(leader as StudentLeader),
                          helperText: (sortConfig as StudentSortConfig).helper?.(leader as StudentLeader),
                        }
                      : {
                          label: sortConfig.label,
                          valueText: (sortConfig as TeacherSortConfig).format(leader as TeacherLeader),
                          helperText: (sortConfig as TeacherSortConfig).helper?.(leader as TeacherLeader),
                        }

                  return (
                    <RankRow
                      key={leader.id}
                      leader={leader}
                      tab={activeTab}
                      metric={metric}
                      classNames={rowClassNames}
                      onHover={handleRowHover}
                      onLeave={handleRowLeave}
                      onViewProfile={handleViewProfile}
                    />
                  )
                })}
              </div>

              {isLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-warning" role="status" aria-label="Đang tải thêm dữ liệu" />
                </div>
              )}

              {!isLoading && leaders.length === 0 && (
                <div className="card card-surface shadow-sm mt-4">
                  <div className="card-body text-center py-5">
                    <h2 className="h5 fw-semibold mb-2">Chưa có dữ liệu</h2>
                    <p className="text-slate mb-0">Danh sách sẽ được cập nhật khi có thành tích mới.</p>
                  </div>
                </div>
              )}

              <div ref={sentinelRef} className="py-2" />

              {!hasMore && leaders.length > 0 && (
                <div className="text-center text-slate small mt-4">Bạn đã xem toàn bộ bảng xếp hạng.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {isMounted && hoverInfo
        ? createPortal(
            <div
              className="card card-surface shadow-lg p-3"
              style={{
                position: "absolute",
                top: hoverInfo.top,
                left: hoverInfo.left,
                width: 280,
                zIndex: 1070,
                pointerEvents: "none",
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <span
                  className="rounded-circle overflow-hidden flex-shrink-0"
                  style={{ width: 48, height: 48, backgroundColor: "#f3f4f6" }}
                >
                  <img
                    src={hoverInfo.leader.avatar}
                    alt={`Ảnh đại diện của ${hoverInfo.leader.name}`}
                    width={48}
                    height={48}
                    style={{ objectFit: "cover" }}
                  />
                </span>
                <div>
                  <div className="fw-semibold">{hoverInfo.leader.name}</div>
                  <div className="text-slate small">Hạng #{hoverInfo.leader.rank}</div>
                </div>
              </div>
              <div className="text-slate small mb-2">
                {hoverInfo.tab === "students"
                  ? `Điểm TB: ${(hoverInfo.leader as StudentLeader).avgScore.toFixed(1)} · Tỉ lệ đỗ: ${
                      (hoverInfo.leader as StudentLeader).passRate
                    }%`
                  : `Đề tạo: ${(hoverInfo.leader as TeacherLeader).examsCreated} · Đánh giá: ${(
                      hoverInfo.leader as TeacherLeader
                    ).avgRating.toFixed(1)}`}
              </div>
              <div className="d-flex flex-wrap gap-2">
                {hoverInfo.leader.badges.slice(0, 3).map((badge) => (
                  <span key={badge} className={CLASS.chip}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}

      {selectedProfile ? (
        <ProfileModal
          tab={selectedProfile.tab}
          leader={selectedProfile.leader}
          onClose={handleCloseProfile}
          classNames={modalClassNames}
        />
      ) : null}
    </main>
  )
}

// ===== Mock data & helpers =====

function mockFetchLeaderboard(
  params: GetLeaderboardParams
): Promise<{ items: Array<StudentLeader | TeacherLeader>; total: number }> {
  const source = params.tab === "students" ? STUDENT_LEADERS : TEACHER_LEADERS
  const filtered = applyLeaderboardFilters(source, params)
  const sorted = sortLeaderboard(filtered, params.tab, params.sortBy)
  const items = paginate(sorted, params.page, params.size)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items,
        total: filtered.length,
      })
    }, 320)
  })
}

function applyLeaderboardFilters<T extends StudentLeader | TeacherLeader>(
  data: T[],
  params: GetLeaderboardParams
): T[] {
  return data.filter((item) => item.category === params.category && item.timeframe === params.timeframe)
}

function sortLeaderboard(
  data: Array<StudentLeader | TeacherLeader>,
  tab: LeaderTab,
  sortBy: StudentSortOption | TeacherSortOption
) {
  const sorted = [...data]
  if (tab === "students") {
    const sorter = STUDENT_SORT_CONFIG[sortBy as StudentSortOption]
    sorted.sort((a, b) => sorter.getValue(b as StudentLeader) - sorter.getValue(a as StudentLeader))
  } else {
    const sorter = TEACHER_SORT_CONFIG[sortBy as TeacherSortOption]
    sorted.sort((a, b) => sorter.getValue(b as TeacherLeader) - sorter.getValue(a as TeacherLeader))
  }
  return sorted
}

function paginate<T>(data: T[], page: number, size: number): T[] {
  const start = (page - 1) * size
  return data.slice(start, start + size)
}

function createStudentLeaders(): StudentLeader[] {
  const categories: LeaderCategory[] = ["THPT", "Đại học", "Công chức", "Chứng chỉ"]
  const timeframes: TimeframeOption[] = ["week", "month", "all"]

  return Array.from({ length: 100 }, (_, index) => {
    const category = categories[index % categories.length]
    const timeframe = timeframes[index % timeframes.length]
    const rank = index + 1
    const examsTaken = Math.max(12, 40 - (index % 15))
    const avgScore = clampNumber(8.7 - (index % 6) * 0.18, 6.0, 9.5)
    const passRate = clampNumber(97 - index * 0.6, 70, 99)
    const streakDays = Math.max(2, 18 - (index % 8))

    return {
      id: `student-${index + 1}`,
      name: `Học viên ${index + 1}`,
      avatar: `https://i.pravatar.cc/96?img=${(index % 70) + 5}`,
      classLabel: category === "Đại học" ? "Năm 2 · Khoa Kinh tế" : "Lớp luyện thi tiêu chuẩn",
      category,
      timeframe,
      examsTaken,
      avgScore: Number(avgScore.toFixed(1)),
      passRate: Math.round(passRate),
      streakDays,
      rank,
      score: Number((96 - index * 0.65).toFixed(1)),
      badges: pickBadges(["Top tuần", "Chuỗi 14 ngày", "Điểm TB 9+", "Học đều đặn", "Đề khó ưa thích"], index),
      history: createStudentHistory(index, category),
    }
  })
}

function createTeacherLeaders(): TeacherLeader[] {
  const categories: LeaderCategory[] = ["THPT", "Đại học", "Công chức", "Chứng chỉ"]
  const timeframes: TimeframeOption[] = ["week", "month", "all"]

  return Array.from({ length: 100 }, (_, index) => {
    const category = categories[(index + 1) % categories.length]
    const timeframe = timeframes[index % timeframes.length]
    const rank = index + 1
    const examsCreated = Math.max(4, 24 - Math.floor(index / 3))
    const totalTakers = Math.max(260, 3200 - index * 90)
    const avgRating = clampNumber(4.8 - (index % 7) * 0.08, 3.6, 4.95)

    return {
      id: `teacher-${index + 1}`,
      name: `Giáo viên ${index + 1}`,
      avatar: `https://i.pravatar.cc/96?img=${(index % 70) + 35}`,
      organization: category === "Đại học" ? "Đại học Sư phạm" : "Hệ thống BeeExamine",
      category,
      timeframe,
      examsCreated,
      totalTakers,
      avgRating: Number(avgRating.toFixed(1)),
      rank,
      score: Number((94 - index * 0.6).toFixed(1)),
      badges: pickBadges(["Đề hot tuần", "Giảng viên tiêu biểu", "Đánh giá 4.8+", "Tương tác cao", "Chuyên gia chủ đề"], index),
      portfolio: createTeacherPortfolio(index, category),
    }
  })
}

function createStudentHistory(index: number, category: LeaderCategory) {
  const baseDate = new Date()
  return Array.from({ length: 3 }, (_, historyIndex) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - (index * 2 + historyIndex * 3 + 2))
    const score = clampNumber(7.2 + (index % 4) * 0.35 + historyIndex * 0.25, 6.0, 10)
    return {
      id: `student-history-${index + 1}-${historyIndex}`,
      examTitle: `${category} · Đề luyện số ${historyIndex + 1}`,
      score: Number(score.toFixed(1)),
      date: date.toLocaleDateString("vi-VN"),
      status: score >= 7.5 ? "passed" : "failed",
    }
  })
}

function createTeacherPortfolio(index: number, category: LeaderCategory) {
  const baseDate = new Date()
  return Array.from({ length: 3 }, (_, portfolioIndex) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - (index * 3 + portfolioIndex * 5 + 4))
    const takers = Math.max(180, 900 - index * 22 - portfolioIndex * 30)
    return {
      id: `teacher-portfolio-${index + 1}-${portfolioIndex}`,
      examTitle: `${category} · Bộ đề số ${portfolioIndex + 1}`,
      takers,
      updatedAt: date.toLocaleDateString("vi-VN"),
    }
  })
}

function pickBadges(source: readonly string[], index: number): string[] {
  const badges = [
    source[index % source.length],
    source[(index + 2) % source.length],
    source[(index + 4) % source.length],
  ]
  return Array.from(new Set(badges))
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
