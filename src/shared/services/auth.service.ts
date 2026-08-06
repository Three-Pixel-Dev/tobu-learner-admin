import { http } from '@/app/api/http-client'
import type {
  ApiResponse,
  AuthMessageDto,
  LoginDto,
  MeDto,
  SessionDto,
} from '@/app/api/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  name: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const authService = {
  login(payload: LoginPayload) {
    return unwrap(http.post<ApiResponse<LoginDto>>('/api/auth/login', payload))
  },

  me() {
    return unwrap(http.get<ApiResponse<MeDto>>('/api/auth/me'))
  },

  updateProfile(payload: UpdateProfilePayload) {
    return unwrap(http.put<ApiResponse<MeDto>>('/api/auth/profile', payload))
  },

  changePassword(payload: ChangePasswordPayload) {
    return unwrap(http.post<ApiResponse<AuthMessageDto>>('/api/auth/change-password', payload))
  },

  listSessions() {
    return unwrap(http.get<ApiResponse<SessionDto[]>>('/api/auth/sessions'))
  },

  revokeSession(sessionId: number) {
    return unwrap(http.delete<ApiResponse<AuthMessageDto>>(`/api/auth/sessions/${sessionId}`))
  },

  logout() {
    return unwrap(http.post<ApiResponse<AuthMessageDto>>('/api/auth/logout'))
  },

  logoutAll() {
    return unwrap(http.post<ApiResponse<AuthMessageDto>>('/api/auth/logout-all'))
  },
}
