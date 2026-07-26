import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export interface ExamChoiceDto {
  id?: number
  content: string
  correct: boolean
  sortOrder?: number
}

export interface ExamQuestionDto {
  id?: number
  categoryId: number
  categoryCode?: string
  categoryName?: string
  mondaiTitle?: string
  passage?: string
  sentenceStructure?: string
  prompt: string
  audioUrl?: string
  transcript?: string
  furigana?: string
  transMm?: string
  transEn?: string
  explainMm?: string
  explainEn?: string
  sortOrder?: number
  choices: ExamChoiceDto[]
}

export interface ExamDto {
  id: number
  jlptLevelId: number
  jlptLevelCode?: string
  jlptLevelName?: string
  title: string
  titleJp?: string
  timeLimitSeconds: number
  passScore: number
  totalScore: number
  descriptionMm?: string
  descriptionEn?: string
  published: boolean
  comingSoon: boolean
  questionCount?: number
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ExamDetailDto extends ExamDto {
  questions: ExamQuestionDto[]
}

export interface CreateExamPayload {
  jlptLevelId: number
  title: string
  titleJp?: string
  timeLimitSeconds?: number
  passScore?: number
  totalScore?: number
  descriptionMm?: string
  descriptionEn?: string
  published?: boolean
  comingSoon?: boolean
  questions?: ExamQuestionDto[]
}

export interface UpdateExamPayload extends Partial<CreateExamPayload> {}

export interface ExamFilter {
  jlptLevelId?: number
  jlptLevelCode?: string
  search?: string
  published?: boolean
  includeDisabled?: boolean
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const examService = {
  list(filter?: ExamFilter, page = 0, size = 50) {
    return unwrap(
      http.get<ApiResponse<SpringPage<ExamDto>>>('/api/v1/admin/exams', {
        params: { ...filter, page, size },
      }),
    )
  },

  getById(id: number) {
    return unwrap(http.get<ApiResponse<ExamDetailDto>>(`/api/v1/admin/exams/${id}`))
  },

  create(payload: CreateExamPayload) {
    return unwrap(http.post<ApiResponse<ExamDetailDto>>('/api/v1/admin/exams', payload))
  },

  update(id: number, payload: UpdateExamPayload) {
    return unwrap(http.put<ApiResponse<ExamDetailDto>>(`/api/v1/admin/exams/${id}`, payload))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<void>>(`/api/v1/admin/exams/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<ExamDetailDto>>(`/api/v1/admin/exams/${id}/restore`))
  },
}
