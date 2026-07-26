export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  meta: unknown
}

export interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AuthUser {
  userId: number
  email: string
  name: string
  role: string
}

export interface LoginDto {
  accessToken: string
  refreshToken: string
  userId: number
  email: string
  name: string
  role: string
}

export interface MeDto {
  userId: number
  email: string
  name: string
  role: string
  ban: boolean
  createdAt: string
  currentSessionId: number | null
}

export interface SessionDto {
  id: number
  deviceLabel: string
  ipAddress: string | null
  createdAt: string
  lastActiveAt: string
  current: boolean
}

export interface AuthMessageDto {
  message: string
  success: boolean
  otp: string | null
}

export interface UserAdminDto {
  id: number
  name: string
  email: string
  level: string | null
  currentStreak: number
  totalXp: number
  ban: boolean
  deleted: boolean
  updatedAt: string
  createdAt: string
}

export interface UserListMeta extends PageMeta {
  activeCount: number
}
