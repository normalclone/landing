'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ExamCard, type Exam, type Difficulty, type ExamType } from "./_components/ExamCard"
import { ExamCardSkeleton } from "./_components/ExamCardSkeleton"

// Ánh xạ nhanh các className sẵn có để tránh sai khác phong cách giao diện
const CLASS = {
  primaryButton: "btn btn-indigo",
  outlineButton: "btn btn-outline-secondary",
  input: "form-control",
  select: "form-select",
  chip: "badge bg-light text-slate border",
  sidebarCard: "card card-surface shadow-sm",
}

const PAGE_SIZE = 12
const TOTAL_RECORDS = 120

const SUBJECTS = [
  "Toán",
  "Văn",
  "Anh",
  "Lý",
  "Hóa",
  "Sinh",
  "Sử",
  "Địa",
  "GDCD",
  "Tin học",
]

const CREATORS = [
  "Thầy Minh",
  "Cô Lan",
  "Team Beexamine",
  "Thầy Dũng",
  "Cô Chi",
  "Thầy Phú",
  "Cô Hòa",
  "Thầy Hưng",
]

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Dễ" },
  { value: "medium", label: "Trung bình" },
  { value: "hard", label: "Khó" },
]

const DURATION_OPTIONS = [
  { value: 15, label: "≤ 15 phút" },
  { value: 30, label: "≤ 30 phút" },
  { value: 60, label: "≤ 60 phút" },
  { value: 90, label: "≤ 90 phút" },
]

const EXAM_TYPES: ReadonlyArray<ExamType> = ["THPT", "Đại học", "Công chức", "Chứng chỉ"]

const SCORE_DISTRIBUTION_TEMPLATES = [
  [
    { range: "0 - 3", percent: 6 },
    { range: "3 - 5", percent: 18 },
    { range: "5 - 7", percent: 32 },
    { range: "7 - 8.5", percent: 28 },
    { range: "8.5 - 10", percent: 16 },
  ],
  [
    { range: "0 - 3", percent: 3 },
    { range: "3 - 5", percent: 12 },
    { range: "5 - 7", percent: 28 },
    { range: "7 - 8.5", percent: 34 },
    { range: "8.5 - 10", percent: 23 },
  ],
  [
    { range: "0 - 3", percent: 9 },
    { range: "3 - 5", percent: 22 },
    { range: "5 - 7", percent: 36 },
    { range: "7 - 8.5", percent: 24 },
    { range: "8.5 - 10", percent: 9 },
  ],
] as const

const PRE_EXAM_GUIDES = [
  "Kiểm tra cấu trúc đề minh họa mới nhất và ôn kỹ các chủ điểm trọng tâm.",
  "Chuẩn bị máy tính, giấy nháp và đảm bảo đường truyền ổn định trước giờ thi.",
  "Đọc kỹ hướng dẫn làm bài để tránh bỏ sót các câu yêu cầu dạng tự luận.",
  "Canh thời gian hợp lý cho từng phần, ưu tiên các câu hỏi chắc chắn trước.",
]

const POST_EXAM_NOTES = [
  "Đối chiếu đáp án chính thức và ghi chú lại những câu sai để rà soát kiến thức.",
  "Nộp phản hồi nếu phát hiện lỗi đề hoặc câu hỏi chưa rõ ràng.",
  "Review lại những câu làm mất nhiều thời gian để tối ưu chiến lược cho lần thi chính.",
]

const FEEDBACK_HIGHLIGHTS = [
  "Nhiều câu hỏi bám sát đề minh họa mới nhất.",
  "Độ khó phân hóa rõ, phù hợp luyện thi nước rút.",
  "Tài liệu giải chi tiết giúp tự học dễ dàng hơn.",
  "Kho câu hỏi cập nhật hàng tháng theo góp ý của giáo viên.",
]

const CHANGELOG_NOTES = [
  "Điều chỉnh lại thứ tự câu hỏi để tăng độ phân hóa năng lực.",
  "Bổ sung thêm 2 câu vận dụng cao vào phần cuối đề.",
  "Cập nhật đáp án chi tiết và mẹo ghi điểm nhanh.",
  "Rà soát chính tả, chuẩn hóa thống nhất ký hiệu.",
]

const SUBJECT_TOPICS: Record<string, string[]> = {
  Toán: [
    "phương trình mũ - logarit",
    "hình học không gian Oxyz",
    "giới hạn và đạo hàm",
    "tích phân ứng dụng thực tế",
  ],
  Văn: [
    "phân tích hình tượng nhân vật trung tâm",
    "đánh giá nghệ thuật xây dựng tình huống truyện",
    "so sánh các hình ảnh biểu tượng",
    "bình luận quan điểm sáng tác của tác giả",
  ],
  Anh: [
    "ngữ pháp thì hoàn thành tiếp diễn",
    "cách sử dụng mệnh đề quan hệ rút gọn",
    "từ vựng chủ đề môi trường",
    "chiến lược làm bài đọc hiểu nhanh",
  ],
  Lý: [
    "dao động điều hòa và năng lượng",
    "mạch xoay chiều RLC",
    "cảm ứng điện từ",
    "lượng tử ánh sáng",
  ],
  Hóa: [
    "cân bằng phản ứng oxi hóa khử",
    "tổng hợp và nhận biết este",
    "cấu trúc peptit trong protein",
    "tốc độ phản ứng và cân bằng hóa học",
  ],
  Sinh: [
    "quy luật di truyền phân li độc lập",
    "điều hòa hoạt động gen ở sinh vật",
    "tiến hóa nhỏ và quần thể sinh vật",
    "sinh thái học quần xã",
  ],
  Sử: [
    "phong trào giải phóng dân tộc Đông Nam Á",
    "Việt Nam thời kỳ đổi mới 1986-2000",
    "chiến dịch Điện Biên Phủ 1954",
    "chính sách kinh tế mới của Liên Xô",
  ],
  Địa: [
    "vùng kinh tế trọng điểm phía Nam",
    "biến đổi khí hậu và tài nguyên nước Việt Nam",
    "các trung tâm công nghiệp trọng điểm",
    "đặc điểm dân cư và đô thị hóa",
  ],
  GDCD: [
    "quyền và nghĩa vụ công dân trong Hiến pháp",
    "các nguyên tắc xây dựng pháp luật",
    "đạo đức nghề nghiệp và trách nhiệm xã hội",
    "quyền tự do kinh doanh theo pháp luật",
  ],
  "Tin học": [
    "thuật toán sắp xếp và phân tích độ phức tạp",
    "ứng dụng bảng tính trong xử lý dữ liệu",
    "cơ sở lập trình hướng đối tượng",
  "mạng máy tính và bảo mật thông tin",
  ],
}

const DEFAULT_TOPICS = [
  "nhận diện dạng bài trọng tâm",
  "các lỗi thường gặp khi làm bài",
  "phương pháp loại trừ đáp án nhanh",
  "mẹo ghi nhớ kiến thức nền tảng",
]

const ACTIVITY_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const FEEDBACK_COMMENTERS = [
  "Minh Trí",
  "Lan Anh",
  "Quỳnh Chi",
  "Khánh Duy",
  "Thu Hà",
  "Ngọc Bích",
  "Hoàng Anh",
  "Phương Linh",
  "Gia Huy",
  "Trúc Ly",
]

const FEEDBACK_COMMENT_MESSAGES = [
  "Đề bám rất sát cấu trúc mới, phần lý thuyết phân chia rõ ràng nên ôn tập dễ.",
  "Câu hỏi vận dụng cao khá thử thách nhưng có lời giải chi tiết nên theo kịp.",
  "Thời lượng 60 phút là hợp lý, giúp luyện cách phân bổ thời gian lúc đi thi.",
  "Các câu hỏi đọc hiểu cập nhật chủ đề thời sự, làm mình thấy hứng thú hơn nhiều.",
  "Nhóm câu hỏi cuối có độ khó tăng dần, rất giống đề của Sở năm vừa rồi.",
  "Sau khi nộp bài xem lại đáp án khá dễ hiểu, các mẹo giải được ghi chú rõ.",
  "Đề có nhiều câu phân hóa tốt, bạn nào luyện kỹ sẽ nắm chắc cấu trúc.",
  "Kho câu hỏi giống như một mini mock test, phù hợp để kiểm tra nhanh kiến thức.",
]

const FEEDBACK_AVATAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#db2777",
]

type QuickFilterKey = "topRated" | "mostTaken" | "recent"

const QUICK_FILTERS: { key: QuickFilterKey; label: string }[] = [
  { key: "topRated", label: "Đánh giá cao" },
  { key: "mostTaken", label: "Nhiều người thi" },
  { key: "recent", label: "Mới cập nhật" },
]

type SortOption = "relevance" | "mostTaken" | "avgScore" | "recent" | "durationAsc"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Phù hợp nhất" },
  { value: "mostTaken", label: "Nhiều người thi" },
  { value: "avgScore", label: "Điểm TB cao" },
  { value: "recent", label: "Mới cập nhật" },
  { value: "durationAsc", label: "Thời lượng tăng dần" },
]

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

type FilterState = {
  difficulty: Difficulty[]
  durations: number[]
  type: ExamType | "Tất cả"
  quickFilters: Record<QuickFilterKey, boolean>
}

// Khởi tạo filter mặc định để tái sử dụng khi reset
const createDefaultFilters = (): FilterState => ({
  difficulty: [],
  durations: [],
  type: "Tất cả",
  quickFilters: {
    topRated: false,
    mostTaken: false,
    recent: false,
  },
})

const cloneFilters = (filters: FilterState): FilterState => ({
  difficulty: [...filters.difficulty],
  durations: [...filters.durations],
  type: filters.type,
  quickFilters: { ...filters.quickFilters },
})

type GetExamParams = {
  q?: string
  subjects?: string[]
  difficulty?: Difficulty[]
  durations?: number[]
  type?: ExamType | "Tất cả"
  sortBy?: SortOption
  page?: number
  size?: number
  flags?: Partial<Record<QuickFilterKey, boolean>>
}

type GetExamsResponse = {
  items: Exam[]
  total: number
}

// Sinh dữ liệu mock để phát triển trước khi kết nối API thật
const MOCK_EXAMS: Exam[] = generateMockExams(TOTAL_RECORDS)

// TODO: Thay adapter này bằng fetch("/api/exams?...") khi API thật sẵn sàng
async function getExams(params: GetExamParams): Promise<GetExamsResponse> {
  const page = params.page ?? 1
  const size = params.size ?? PAGE_SIZE
  const filtered = applyFilters(MOCK_EXAMS, params)
  const sorted = sortExams(filtered, params.sortBy ?? "relevance", params.q)
  const items = paginateExams(sorted, page, size)
  await delay(320)
  return {
    items,
    total: filtered.length,
  }
}

// Component trang Exams
export default function ExamsPage() {
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("relevance")

  // Khởi tạo hiệu ứng xuất hiện cho các phần tử có data-animate

  useEffect(() => {

    if (typeof window === "undefined") {

      return

    }



    const animatedElements = Array.from(

      document.querySelectorAll<HTMLElement>("[data-animate]")

    )



    if (animatedElements.length === 0) {

      return

    }



    const prefersReducedMotion =

      typeof window.matchMedia === "function"

        ? window.matchMedia("(prefers-reduced-motion: reduce)")

        : null



    const activate = (element: HTMLElement) => {

      element.classList.add("is-visible")

    }



    if (

      (prefersReducedMotion && prefersReducedMotion.matches) ||

      !("IntersectionObserver" in window)

    ) {

      animatedElements.forEach(activate)

      return

    }



    const observer = new IntersectionObserver(

      (entries, obs) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            activate(entry.target as HTMLElement)

            obs.unobserve(entry.target)

          }

        })

      },

      {

        threshold: 0.2,

        rootMargin: "0px 0px -12%",

      }

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





  const [draftFilters, setDraftFilters] = useState<FilterState>(() => createDefaultFilters())
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => createDefaultFilters())

  const [exams, setExams] = useState<Exam[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null)
  const animationObserverRef = useRef<IntersectionObserver | null>(null)
  const requestIdRef = useRef(0)

  const appliedDifficultyKey = useMemo(
    () => appliedFilters.difficulty.slice().sort().join("|"),
    [appliedFilters.difficulty]
  )

  const appliedDurationsKey = useMemo(
    () => appliedFilters.durations.slice().sort((a, b) => a - b).join("|"),
    [appliedFilters.durations]
  )

  const appliedQuickFiltersKey = useMemo(
    () =>
      QUICK_FILTERS.map((filter) => `${filter.key}:${appliedFilters.quickFilters[filter.key] ? 1 : 0}`).join("|"),
    [appliedFilters.quickFilters]
  )

  const activeChips = useMemo(() => {
    const chips: string[] = []

    if (query.trim()) {
      chips.push(`Từ khóa: "${query.trim()}"`)
    }

    if (appliedFilters.difficulty.length > 0) {
      appliedFilters.difficulty.forEach((diff) => {
        chips.push(`Độ khó: ${difficultyLabels[diff]}`)
      })
    }

    appliedFilters.durations.forEach((limit) => {
      chips.push(`≤ ${limit} phút`)
    })

    if (appliedFilters.type !== "Tất cả") {
      chips.push(`Loại: ${appliedFilters.type}`)
    }

    QUICK_FILTERS.forEach((filter) => {
      if (appliedFilters.quickFilters[filter.key]) {
        chips.push(filter.label)
      }
    })

    return chips
  }, [appliedFilters, query])



  // Đảm bảo phần tử mới thêm (ví dụ card) được gắn observer kiểm soát animate

  useEffect(() => {

    const observer = animationObserverRef.current

    if (!observer) {

      return

    }



    const animatedElements = Array.from(

      document.querySelectorAll<HTMLElement>("[data-animate]:not(.is-visible)")

    )



    animatedElements.forEach((element) => observer.observe(element))



    return () => {

      animatedElements.forEach((element) => observer.unobserve(element))

    }

  }, [exams, activeChips.length, hasMore, isLoading])

  // Reset phân trang khi tham số tìm kiếm thay đổi
  useEffect(() => {
    setExams([])
    setHasMore(true)
    setPage(1)
  }, [
    query,
    sortBy,
    appliedFilters.type,
    appliedFilters.durations,
    appliedFilters.difficulty,
    appliedFilters.quickFilters,
    appliedDurationsKey,
    appliedQuickFiltersKey,
    appliedDifficultyKey,
  ])

  // Nạp dữ liệu trang hiện tại
  useEffect(() => {
    const params: GetExamParams = {
      q: query.trim() || undefined,
      difficulty: appliedFilters.difficulty.length > 0 ? appliedFilters.difficulty : undefined,
      durations: appliedFilters.durations.length > 0 ? appliedFilters.durations : undefined,
      type: appliedFilters.type === "Tất cả" ? undefined : appliedFilters.type,
      sortBy,
      page,
      size: PAGE_SIZE,
      flags: appliedFilters.quickFilters,
    }

    let cancelled = false
    const currentRequestId = ++requestIdRef.current

    setIsLoading(true)
    getExams(params)
      .then((response) => {
        if (cancelled || currentRequestId !== requestIdRef.current) {
          return
        }

        setTotal(response.total)
        setHasMore(page * PAGE_SIZE < response.total)
        setExams((previous) => (page === 1 ? response.items : [...previous, ...response.items]))
      })
      .finally(() => {
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [
    page,
    query,
    sortBy,
    appliedFilters.type,
    appliedFilters.durations,
    appliedFilters.difficulty,
    appliedFilters.quickFilters,
    appliedDurationsKey,
    appliedQuickFiltersKey,
    appliedDifficultyKey,
  ])

  // Khởi tạo infinite scroll bằng IntersectionObserver
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return
    }

    if (sentinelObserverRef.current) {
      sentinelObserverRef.current.disconnect()
    }

    sentinelObserverRef.current = new IntersectionObserver((entries) => {
      const targetEntry = entries[0]
      if (targetEntry?.isIntersecting && hasMore && !isLoading) {
        setPage((prev) => prev + 1)
      }
    })

    const sentinel = sentinelRef.current
    if (sentinel) {
      sentinelObserverRef.current.observe(sentinel)
    }

    return () => {
      sentinelObserverRef.current?.disconnect()
    }
  }, [hasMore, isLoading])

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setQuery(searchInput.trim())
    },
    [searchInput]
  )

  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption)
  }, [])

  const handleTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as ExamType | "Tất cả"
    setDraftFilters((previous) => ({
      ...previous,
      type: nextType,
    }))
  }, [])

  const handleDifficultyToggle = useCallback((value: Difficulty) => {
    setDraftFilters((previous) => {
      const isActive = previous.difficulty.includes(value)
      return {
        ...previous,
        difficulty: isActive
          ? previous.difficulty.filter((item) => item !== value)
          : [...previous.difficulty, value],
      }
    })
  }, [])

  const handleDurationSelect = useCallback((value: number) => {
    setDraftFilters((previous) => ({
      ...previous,
      durations: [value],
    }))
  }, [])

  const handleQuickFilterToggle = useCallback((key: QuickFilterKey) => {
    setDraftFilters((previous) => ({
      ...previous,
      quickFilters: {
        ...previous.quickFilters,
        [key]: !previous.quickFilters[key],
      },
    }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(() => cloneFilters(draftFilters))
  }, [draftFilters])

  const handleResetFilters = useCallback(() => {
    const resetFilters = createDefaultFilters()
    setDraftFilters(resetFilters)
    setAppliedFilters(createDefaultFilters())
    setSearchInput("")
    setQuery("")
    setSortBy("relevance")
  }, [])

  const skeletonCount = page === 1 ? PAGE_SIZE : Math.min(6, PAGE_SIZE)

  return (
    <main>
      <section className="section pb-0 bg-surface border-bottom border-soft">
        <div data-animate className="container py-5 fade-in">
          <div className="row g-4 align-items-end">
            <div data-animate className="col-12 col-lg-8 fade-in-up">
              <h1 className="display-5 fw-black mb-2">Tìm đề thi &amp; luyện tập</h1>
              <p className="text-slate mb-4">THPT • Đại học • Công chức • Chứng chỉ</p>
              <form className="input-group" onSubmit={handleSearchSubmit}>
                <input
                  className={CLASS.input}
                  type="search"
                  placeholder="Nhập môn học, tiêu đề hoặc người tạo..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <button className={CLASS.primaryButton} type="submit">
                  Tìm
                </button>
              </form>
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
                  <h2 className="h5 fw-semibold mb-4">Bộ lọc đề thi</h2>

                  {/* Độ khó */}
                  <div className="mb-4">
                    <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
                      Độ khó
                    </span>
                    <div className="d-grid gap-2">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <label key={option.value} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name={`difficulty-${option.value}`}
                            checked={draftFilters.difficulty.includes(option.value)}
                            onChange={() =>
                              handleDifficultyToggle(option.value)
                            }
                          />
                          <span className="form-check-label">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Thời lượng */}
                  <div className="mb-4">
                    <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
                      Thời lượng
                    </span>
                    <div className="d-grid gap-2">
                      {DURATION_OPTIONS.map((option) => (
                        <label key={option.value} className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="duration"
                            value={option.value}
                            checked={draftFilters.durations.includes(option.value)}
                            onChange={() => handleDurationSelect(option.value)}
                          />
                          <span className="form-check-label">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Loại kỳ thi */}
                  <div className="mb-4">
                    <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
                      Loại kỳ thi
                    </span>
                    <select className={CLASS.select} value={draftFilters.type} onChange={handleTypeChange}>
                      <option value="Tất cả">Tất cả</option>
                      {EXAM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bộ lọc nhanh */}
                  <div className="mb-4">
                    <span className="text-slate text-uppercase small fw-semibold d-block mb-2">
                      Bộ lọc nhanh
                    </span>
                    <div className="d-flex flex-wrap gap-2">
                      {QUICK_FILTERS.map((filter) => {
                        const isActive = draftFilters.quickFilters[filter.key]
                        return (
                          <button
                            key={filter.key}
                            type="button"
                            className={`btn btn-sm ${isActive ? "btn-secondary" : "btn-outline-secondary"}`}
                            onClick={() => handleQuickFilterToggle(filter.key)}
                          >
                            {filter.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-honey btn-icon d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      onClick={handleResetFilters}
                      aria-label="Reset filters"
                    >
                      <span className="visually-hidden">Đặt lại bộ lọc</span>
                      <span aria-hidden="true" className="btn-icon__glyph">
                        ↻
                      </span>
                    </button>
                    <button
                      className={`${CLASS.primaryButton} flex-grow-1`}
                      type="button"
                      onClick={handleApplyFilters}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div data-animate className="col-12 col-lg-9 fade-in-up">
              <div data-animate className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 fade-in-up">
                <div className="fw-semibold pt-4">
                  {total > 0 ? `${total} đề thi phù hợp` : "Không có đề thi phù hợp"}
                </div>
                <div className="text-slate small">
                  <div className="d-flex flex-column gap-2 align-items-stretch align-items-lg-end">
                    <div className="w-100">
                      <label className="form-label small text-slate mb-1">Sắp xếp</label>
                      <select className={CLASS.select} value={sortBy} onChange={handleSortChange}>
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-4">
                {exams.map((exam) => (
                  <div className="col-12 col-md-6 col-xl-4" key={exam.id}>
                    <ExamCard exam={exam} />
                  </div>
                ))}

                {isLoading &&
                  Array.from({ length: skeletonCount }).map((_, index) => (
                    <div className="col-12 col-md-6 col-xl-4" key={`skeleton-${index}`} aria-hidden="true">
                      <ExamCardSkeleton />
                    </div>
                  ))}
              </div>

              {isLoading && (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border text-warning" role="status" aria-label="Đang tải thêm đề thi" />
                </div>
              )}

              {!isLoading && exams.length === 0 && (
                <div data-animate className="card card-surface shadow-sm mt-4 fade-in">
                  <div className="card-body text-center py-5">
                    <h2 className="h5 fw-semibold mb-2">Chưa tìm thấy đề thi nào</h2>
                    <p className="text-slate mb-0">
                      Hãy thử điều chỉnh từ khóa hoặc xoá bớt điều kiện lọc để xem thêm đề thi.
                    </p>
                  </div>
                </div>
              )}

              <div ref={sentinelRef} className="py-2" />

              {!hasMore && exams.length > 0 && (

                <div data-animate className="text-center text-slate small mt-4 fade-in">

                  Bạn đã xem hết danh sách đề thi.

                </div>

              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// ===== Helpers: filter, sort, paginate, mock data =====

function applyFilters(exams: Exam[], params: GetExamParams): Exam[] {
  const { q, difficulty, durations, type, flags } = params
  const term = q?.toLowerCase().trim()

  return exams.filter((exam) => {
    if (term) {
      const haystacks = [exam.title, exam.subject, exam.creator].map((value) => value.toLowerCase())
      const matches = haystacks.some((haystack) => haystack.includes(term))
      if (!matches) {
        return false
      }
    }

    if (difficulty && difficulty.length > 0 && !difficulty.includes(exam.difficulty)) {
      return false
    }

    if (durations && durations.length > 0) {
      const matchesDuration = durations.some((limit) => exam.duration <= limit)
      if (!matchesDuration) {
        return false
      }
    }

    if (type && type !== "Tất cả" && exam.type !== type) {
      return false
    }

    if (flags) {
      for (const key of QUICK_FILTERS.map((filter) => filter.key)) {
        if (flags[key] && !exam.flags[key]) {
          return false
        }
      }
    }

    return true
  })
}


function sortExams(exams: Exam[], sortBy: SortOption, query?: string): Exam[] {
  const sorted = [...exams]
  const term = query?.toLowerCase().trim()

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "mostTaken":
        return b.attempts - a.attempts
      case "avgScore":
        return b.avgScore - a.avgScore
      case "recent":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case "durationAsc":
        return a.duration - b.duration
      case "relevance":
      default: {
        const scoreA = getRelevanceScore(a, term)
        const scoreB = getRelevanceScore(b, term)
        return scoreB - scoreA
      }
    }
  })

  return sorted
}

function paginateExams(exams: Exam[], page: number, size: number): Exam[] {
  const start = (page - 1) * size
  return exams.slice(start, start + size)
}

function getRelevanceScore(exam: Exam, term?: string): number {
  let score = 0

  if (exam.flags.topRated) score += 4
  if (exam.flags.mostTaken) score += 3
  if (exam.flags.recent) score += 2

  score += Math.min(exam.avgScore, 10)
  score += Math.min(exam.attempts / 250, 6)

  if (term) {
    const lowerTitle = exam.title.toLowerCase()
    const lowerSubject = exam.subject.toLowerCase()
    const lowerCreator = exam.creator.toLowerCase()

    if (lowerTitle.includes(term)) score += 6
    if (lowerSubject.includes(term)) score += 3
    if (lowerCreator.includes(term)) score += 2
  }

  const updatedAt = new Date(exam.updatedAt).getTime()
  const daysSinceUpdate = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24)
  score += Math.max(0, 10 - daysSinceUpdate / 5)

  return score
}

function delay(ms: number) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve(undefined)
    }, ms)
  })
}


function generateMockExams(count: number): Exam[] {
  const now = Date.now()
  return Array.from({ length: count }).map((_, index) => {
    const subject = pickRandom(SUBJECTS)
    const type = pickRandom(EXAM_TYPES)
    const difficulty = pickRandom(DIFFICULTY_OPTIONS).value
    const duration = pickRandom([15, 20, 25, 30, 40, 45, 50, 60, 75, 90])
    const attempts = randomInt(120, 5400)
    const avgScore = Number(randomFloat(5.0, 9.6).toFixed(1))
    const daysAgo = randomInt(0, 180)
    const updatedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    const creator = pickRandom(CREATORS)
    const iteration = randomInt(1, 3)
    const year = 2023 + randomInt(0, 2)
    const title = `Đề thi thử ${type} ${year} – Môn ${subject} – Lần ${iteration}`

    const topRated = avgScore >= 8.4 || Math.random() > 0.7
    const mostTaken = attempts >= 1800 || Math.random() > 0.75
    const recent = daysAgo <= 45

    const exam: Exam = {
      id: `exam-${index + 1}`,
      title,
      subject,
      duration,
      difficulty,
      attempts,
      avgScore,
      creator,
      type,
      updatedAt,
      flags: {
        topRated,
        mostTaken,
        recent,
      },
      passScore: generatePassScore(difficulty),
      certificateEnabled: topRated || avgScore >= 8.2 || Math.random() > 0.55,
      timeLimit: Math.random() > 0.12 ? duration : 0,
      allowPause: Math.random() > (difficulty === "hard" ? 0.58 : 0.36),
      uniqueCandidates: Math.min(
        attempts,
        Math.max(1, Math.round(attempts * randomFloat(0.45, 0.82)))
      ),
      scoreDistribution: generateScoreDistribution(avgScore),
      preExamNote: pickRandom(PRE_EXAM_GUIDES),
      postExamNote: pickRandom(POST_EXAM_NOTES),
      sampleQuestions: generateSampleQuestions(subject),
      activityHistory: generateActivityHistory(updatedAt, creator),
      feedback: generateFeedback(avgScore),
    }

    return exam
  })
}

function generatePassScore(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return Number(randomFloat(5.0, 6.4).toFixed(1))
    case "medium":
      return Number(randomFloat(6.0, 7.4).toFixed(1))
    case "hard":
    default:
      return Number(randomFloat(7.0, 8.6).toFixed(1))
  }
}

function generateScoreDistribution(avgScore: number): Exam["scoreDistribution"] {
  const templateIndex = avgScore >= 8 ? 1 : avgScore <= 6.2 ? 2 : 0
  const template = SCORE_DISTRIBUTION_TEMPLATES[templateIndex]

  const jittered = template.map((bucket) => ({
    range: bucket.range,
    percent: Math.max(1, bucket.percent + randomInt(-2, 2)),
  }))

  const total = jittered.reduce((sum, bucket) => sum + bucket.percent, 0)
  const normalized = jittered.map((bucket) => ({
    range: bucket.range,
    percent: Math.max(0, Math.round((bucket.percent / total) * 100)),
  }))

  let diff = 100 - normalized.reduce((sum, bucket) => sum + bucket.percent, 0)
  while (diff !== 0) {
    const targetIndex =
      diff > 0 ? normalized.length - 1 : normalized.findIndex((bucket) => bucket.percent > 0)
    if (targetIndex < 0) {
      break
    }
    if (diff > 0) {
      normalized[targetIndex].percent += 1
      diff -= 1
    } else {
      normalized[targetIndex].percent -= 1
      diff += 1
    }
  }

  return normalized
}

function generateSampleQuestions(subject: string): string[] {
  const subjectTopics = SUBJECT_TOPICS[subject] ?? DEFAULT_TOPICS
  const pool = [...subjectTopics]
  if (pool.length < 3) {
    pool.push(...DEFAULT_TOPICS)
  }

  const questions: string[] = []
  while (questions.length < 3 && pool.length > 0) {
    const index = randomInt(0, pool.length - 1)
    const topic = pool.splice(index, 1)[0]
    questions.push(
      `Trình bày ngắn gọn về "${capitalize(topic)}" trong môn ${subject} và nêu ví dụ minh họa.`
    )
  }

  while (questions.length < 3) {
    const fallback = pickRandom(DEFAULT_TOPICS)
    questions.push(
      `Phân tích vì sao "${capitalize(fallback)}" thường xuất hiện trong đề môn ${subject}.`
    )
  }

  return questions
}

function generateActivityHistory(updatedAt: string, creator: string): Exam["activityHistory"] {
  const updatedDate = new Date(updatedAt)
  const publishedDate = randomizeTime(subtractDays(updatedDate, randomInt(2, 16)))
  const revisedDate = randomizeTime(subtractDays(updatedDate, randomInt(9, 36)))
  const createdDate = randomizeTime(subtractDays(updatedDate, randomInt(40, 120)))

  return [
    { label: `Tạo bởi ${creator}`, timestamp: formatActivityTimestamp(createdDate) },
    { label: "Sửa nội dung ngân hàng câu hỏi", timestamp: formatActivityTimestamp(revisedDate) },
    { label: "Phát hành phiên bản mới", timestamp: formatActivityTimestamp(publishedDate) },
    {
      label: "Ghi chú thay đổi phiên bản",
      timestamp: `${formatActivityTimestamp(updatedDate)} – ${pickRandom(CHANGELOG_NOTES)}`,
    },
  ]
}

function generateFeedback(avgScore: number): Exam["feedback"] {
  const base = Math.min(4.9, Math.max(3.6, avgScore / 2 + randomFloat(-0.35, 0.45)))
  return {
    rating: Number(base.toFixed(1)),
    totalReviews: randomInt(24, 460),
    highlight: pickRandom(FEEDBACK_HIGHLIGHTS),
    comments: generateFeedbackComments(avgScore),
  }
}

function generateFeedbackComments(avgScore: number): Exam["feedback"]["comments"] {
  const commentsCount = randomInt(3, 4)
  const usedNames = new Set<string>()

  return Array.from({ length: commentsCount }).map((_, index) => {
    const name = pickUniqueName(FEEDBACK_COMMENTERS, usedNames)
    const rating = Math.min(5, Math.max(3, Math.round(avgScore / 2 + randomFloat(-0.2, 1.1))))
    const message = pickRandom(FEEDBACK_COMMENT_MESSAGES)
    const minutesAgo = randomInt(45, 60 * 24 * 21)

    return {
      id: `comment-${index + 1}-${randomInt(100, 999)}`,
      name,
      avatarInitials: createInitials(name),
      avatarColor: pickRandom(FEEDBACK_AVATAR_COLORS),
      rating,
      message,
      timestamp: formatRelativeTimeFromMinutes(minutesAgo),
    }
  })
}

function randomizeTime(date: Date): Date {
  const cloned = new Date(date)
  cloned.setHours(randomInt(7, 21), randomInt(0, 59), 0, 0)
  return cloned
}

function subtractDays(date: Date, days: number): Date {
  const cloned = new Date(date)
  cloned.setDate(cloned.getDate() - days)
  return cloned
}

function formatActivityTimestamp(date: Date): string {
  return ACTIVITY_TIME_FORMATTER.format(date)
}

function capitalize(text: string): string {
  if (!text) {
    return text
  }
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function pickUniqueName(pool: ReadonlyArray<string>, used: Set<string>): string {
  const available = pool.filter((item) => !used.has(item))
  const name = available.length > 0 ? pickRandom(available) : pickRandom(pool)
  used.add(name)
  return name
}

function createInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) {
    return "?"
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1].charAt(0)
  return `${first}${last}`.toUpperCase()
}

function formatRelativeTimeFromMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.max(1, totalMinutes)} phút trước`
  }

  const hours = Math.round(totalMinutes / 60)
  if (hours < 24) {
    return `${Math.max(1, hours)} giờ trước`
  }

  const days = Math.round(totalMinutes / (60 * 24))
  if (days < 7) {
    return `${Math.max(1, days)} ngày trước`
  }

  const weeks = Math.round(days / 7)
  if (weeks < 5) {
    return `${Math.max(1, weeks)} tuần trước`
  }

  const months = Math.round(days / 30)
  if (months < 12) {
    return `${Math.max(1, months)} tháng trước`
  }

  const years = Math.max(1, Math.round(days / 365))
  return `${years} năm trước`
}
function pickRandom<T>(items: ReadonlyArray<T>): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInt(min: number, max: number): number {
  const lower = Math.ceil(min)
  const upper = Math.floor(max)
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}











