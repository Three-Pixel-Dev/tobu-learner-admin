import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export type ExamSectionCode = 'VOCAB' | 'GRAMMAR' | 'READING' | 'LISTENING'

export interface ExamChoiceDto {
  id?: number
  content: string
  correct: boolean
  sortOrder?: number
}

export interface ExamQuestionDto {
  id?: number
  categoryId?: number
  categoryCode?: ExamSectionCode | string
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

export type UpdateExamPayload = Partial<CreateExamPayload>

export interface ExamFilter {
  jlptLevelId?: number
  jlptLevelCode?: string
  search?: string
  published?: boolean
  includeDisabled?: boolean
}

export interface ExamPageRequest {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter?: ExamFilter
}

export interface ExamPageResult {
  data: ExamDto[]
  meta: PageMeta
}

async function unwrapPage(promise: Promise<{ data: ApiResponse<ExamDto[]> }>): Promise<ExamPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 12, totalElements: 0, totalPages: 0 },
  }
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const examService = {
  page(request: ExamPageRequest) {
    return unwrapPage(
      http.post<ApiResponse<ExamDto[]>>('/api/v1/admin/exams/pageable', {
        pageNumber: request.pageNumber ?? 1,
        pageSize: request.pageSize ?? 12,
        sortBy: request.sortBy ?? 'createdAt',
        sortOrder: request.sortOrder ?? 'DESC',
        filter: {
          jlptLevelId: request.filter?.jlptLevelId,
          jlptLevelCode: request.filter?.jlptLevelCode,
          search: request.filter?.search?.trim() || undefined,
          published: request.filter?.published,
          includeDisabled: request.filter?.includeDisabled ?? false,
        },
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

  uploadQuestionsBatch(id: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(
      http.post<ApiResponse<ExamDetailDto>>(`/api/v1/admin/exams/${id}/questions/batch-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },
}
