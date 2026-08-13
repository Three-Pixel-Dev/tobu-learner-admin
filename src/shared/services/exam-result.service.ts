import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export interface ExamSkillBreakdownDto {
  vocabCorrect: number
  vocabTotal: number
  grammarCorrect: number
  grammarTotal: number
  readingCorrect: number
  readingTotal: number
  listeningCorrect: number
  listeningTotal: number
}

export interface ExamMondaiBreakdownDto {
  mondaiTitle: string
  categoryCode: string
  correct: number
  total: number
}

export interface ExamResultListDto {
  resultToken: string
  examId: number
  examTitle: string
  examTitleJp: string | null
  jlptLevelCode: string | null
  userName: string
  score: number
  totalScore: number
  passScore: number
  passed: boolean
  timeUsedSeconds: number
  correctCount: number
  questionCount: number
  skills: ExamSkillBreakdownDto
  mondaiBreakdown: ExamMondaiBreakdownDto[]
  completedAt: string
}

export interface ExamResultFilter {
  userId: number
  jlptLevelCode?: string
  passed?: boolean
}

export interface ExamResultPageRequest {
  pageNumber: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter: ExamResultFilter
}

export interface ExamResultPageResult {
  data: ExamResultListDto[]
  meta: PageMeta
}

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<ExamResultListDto[]> }>,
): Promise<ExamResultPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 20, totalElements: 0, totalPages: 0 },
  }
}

export function examResultVerifyUrl(resultToken: string, apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/$/, '')}/verify/${encodeURIComponent(resultToken)}`
}

export const examResultService = {
  page(request: ExamResultPageRequest) {
    return unwrapPage(
      http.post<ApiResponse<ExamResultListDto[]>>('/api/v1/exam-results/pageable', {
        pageNumber: request.pageNumber,
        pageSize: request.pageSize,
        sortBy: request.sortBy ?? 'createdAt',
        sortOrder: request.sortOrder ?? 'DESC',
        filter: {
          userId: request.filter.userId,
          jlptLevelCode: request.filter.jlptLevelCode || undefined,
          passed: request.filter.passed,
        },
      }),
    )
  },
}
