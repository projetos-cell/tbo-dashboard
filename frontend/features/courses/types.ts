export type CourseLevel = "iniciante" | "intermediario" | "avancado"

export type CourseStatus = "em_andamento" | "concluido" | "nao_iniciado"

export type ModuleStatus = "completed" | "in_progress" | "locked"

export interface Course {
  id: string
  title: string
  description: string
  category: string
  instructor: string
  thumbnail: string
  duration: string
  totalModules: number
  completedModules: number
  progress: number
  rating: number
  students: number
  level: CourseLevel
  status: CourseStatus
  tags: string[]
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  duration: string
  order: number
  status: ModuleStatus
  videoUrl?: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  totalCourses: number
  completedCourses: number
  progress: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  points: number
  rank: number
}
