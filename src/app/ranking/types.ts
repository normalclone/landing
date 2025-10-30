export type LeaderTab = "students" | "teachers"

export type LeaderCategory = "THPT" | "Đại học" | "Công chức" | "Chứng chỉ"

export type TimeframeOption = "week" | "month" | "all"

export type StudentSortOption = "score" | "avgScore" | "passRate" | "examsTaken" | "streakDays"

export type TeacherSortOption = "score" | "examsCreated" | "totalTakers" | "avgRating"

export type AnySortOption = StudentSortOption | TeacherSortOption

export type StudentHistoryEntry = {
  id: string
  examTitle: string
  score: number
  date: string
  status: "passed" | "failed"
}

export type TeacherExamEntry = {
  id: string
  examTitle: string
  takers: number
  updatedAt: string
}

export type StudentLeader = {
  id: string
  name: string
  avatar: string
  classLabel?: string
  category: LeaderCategory
  timeframe: TimeframeOption
  examsTaken: number
  avgScore: number
  passRate: number
  streakDays: number
  rank: number
  score: number
  badges: string[]
  history: StudentHistoryEntry[]
}

export type TeacherLeader = {
  id: string
  name: string
  avatar: string
  organization?: string
  category: LeaderCategory
  timeframe: TimeframeOption
  examsCreated: number
  totalTakers: number
  avgRating: number
  rank: number
  score: number
  badges: string[]
  portfolio: TeacherExamEntry[]
}
