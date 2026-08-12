import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export type ReportEntityType =
  | 'LESSON'
  | 'EXAM'
  | 'VOCAB'
  | 'QUESTION'
  | 'EXAM_QUESTION'
  | 'KANJI'
  | 'KANA'
  | 'SYSTEM'

export type ReportCategoryCode = 'VOCAB' | 'GRAMMAR' | 'QUIZ' | 'READING' | 'LISTENING'

export type ReportIssueCode =
  | 'ANSWER_ERROR'
  | 'TECHNICAL_ERROR'
  | 'AUDIO_QUALITY_ERROR'
  | 'TECHNICAL_AUDIO_ERROR'
  | 'IMAGE_ERROR'
  | 'TRANSLATION_ERROR'
  | 'FEEDBACK'
  | 'AUDIO_CONTENT_ERROR'
  | 'INTERFACE_ERROR'
  | 'OTHER'

export interface UserReportDto {
  id: number
  userId: number
  userName: string
  userEmail: string
  entityType: ReportEntityType | string
  entityId: number | null
  categoryCode: ReportCategoryCode | string | null
  issueCode: ReportIssueCode | string
  reason: string
  createdAt: string
}

export interface UserReportFilter {
  entityType?: ReportEntityType | ''
  categoryCode?: ReportCategoryCode | ''
  issueCode?: ReportIssueCode | ''
  userId?: number
  entityId?: number
  search?: string
}

export interface UserReportPageRequest {
  pageNumber: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter?: UserReportFilter
}

export interface UserReportPageResult {
  data: UserReportDto[]
  meta: PageMeta
}

export const REPORT_ENTITY_TYPES: { value: ReportEntityType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'LESSON', label: 'Lesson' },
  { value: 'EXAM', label: 'Exam' },
  { value: 'VOCAB', label: 'Vocab' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'EXAM_QUESTION', label: 'Exam question' },
  { value: 'KANJI', label: 'Kanji' },
  { value: 'KANA', label: 'Kana' },
  { value: 'SYSTEM', label: 'System / settings' },
]

export const REPORT_CATEGORY_CODES: { value: ReportCategoryCode | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'VOCAB', label: 'Vocab' },
  { value: 'GRAMMAR', label: 'Grammar' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'READING', label: 'Reading' },
  { value: 'LISTENING', label: 'Listening' },
]

export const REPORT_ISSUE_CODES: { value: ReportIssueCode | ''; label: string }[] = [
  { value: '', label: 'All issues' },
  { value: 'ANSWER_ERROR', label: 'Answer error' },
  { value: 'TECHNICAL_ERROR', label: 'Technical error' },
  { value: 'AUDIO_QUALITY_ERROR', label: 'Audio quality error' },
  { value: 'TECHNICAL_AUDIO_ERROR', label: 'Technical audio error' },
  { value: 'IMAGE_ERROR', label: 'Image error' },
  { value: 'TRANSLATION_ERROR', label: 'Translation error' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'AUDIO_CONTENT_ERROR', label: 'Audio content error' },
  { value: 'INTERFACE_ERROR', label: 'Interface error' },
  { value: 'OTHER', label: 'Other' },
]

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<UserReportDto[]> }>,
): Promise<UserReportPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 20, totalElements: 0, totalPages: 0 },
  }
}

export const reportService = {
  page(request: UserReportPageRequest) {
    const filter = request.filter
    return unwrapPage(
      http.post<ApiResponse<UserReportDto[]>>('/api/v1/admin/reports/pageable', {
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        sortBy: request.sortBy ?? 'createdAt',
        sortOrder: request.sortOrder ?? 'DESC',
        filter: {
          entityType: filter?.entityType || undefined,
          categoryCode: filter?.categoryCode || undefined,
          issueCode: filter?.issueCode || undefined,
          userId: filter?.userId || undefined,
          entityId: filter?.entityId || undefined,
          search: filter?.search?.trim() || undefined,
        },
      }),
    )
  },
}
