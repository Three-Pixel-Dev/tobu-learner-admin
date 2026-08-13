import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export interface LessonDto {
  id: number
  jlptLevelId: number
  jlptLevelCode: string
  title: string
  externalCode?: string | null
  published: boolean
  deleted: boolean
  vocabCount: number
  grammarCount: number
  quizCount: number
  createdAt: string
  updatedAt: string
}

export interface ChoiceDto {
  id: number | null
  choiceText: string
  correct: boolean
}

export interface VocabDto {
  id: number | null
  word: string
  mmMeaning: string | null
  enMeaning: string | null
  audioUrl: string | null
}

export interface GrammarExampleDto {
  id: number | null
  japaneseText: string
  mmTranslation: string | null
  audioUrl: string | null
  sortOrder: number
}

export interface GrammarDto {
  id: number | null
  pattern: string
  mmDescription: string | null
  enDescription: string | null
  audioUrl: string | null
  examples: GrammarExampleDto[]
}

export interface QuestionDto {
  id: number | null
  categoryCode: string | null
  mondai: string | null
  questionType: string
  prompt: string
  furigana: string | null
  choices: ChoiceDto[]
  explainMm: string | null
  explainEn: string | null
  transMm: string | null
  transEn: string | null
  imageUrl: string | null
  audioUrl: string | null
  sortOrder: number
}

export interface LessonDetailDto {
  id: number
  jlptLevelId: number
  jlptLevelCode: string
  title: string
  externalCode?: string | null
  published: boolean
  deleted: boolean
  vocabs: VocabDto[]
  grammars: GrammarDto[]
  questions: QuestionDto[]
  createdAt: string
  updatedAt: string
}

export interface LessonPageResult {
  data: LessonDto[]
  meta: PageMeta
}

export interface CreateLessonPayload {
  jlptLevelId: number
  title: string
}

export interface UpdateLessonPayload {
  title: string
}

export interface SaveLessonContentPayload {
  vocabs: Array<{
    word: string
    mmMeaning?: string | null
    enMeaning?: string | null
    audioUrl?: string | null
  }>
  grammars: Array<{
    pattern: string
    mmDescription?: string | null
    enDescription?: string | null
    audioUrl?: string | null
    examples?: Array<{
      japaneseText: string
      mmTranslation?: string | null
      audioUrl?: string | null
      sortOrder?: number
    }>
  }>
  questions: Array<{
    questionType?: string
    mondai?: string | null
    prompt: string
    furigana?: string | null
    choices: Array<{ choiceText: string; correct: boolean }>
    explainMm?: string | null
    explainEn?: string | null
    transMm?: string | null
    transEn?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
    sortOrder?: number
  }>
}

export interface LessonBatchUploadResult {
  created: number
  updated: number
  skipped: number
  published: number
  lessonIds: number[]
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<LessonDto[]> }>,
): Promise<LessonPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 10, totalElements: 0, totalPages: 0 },
  }
}

export const lessonService = {
  page(request: {
    pageNumber?: number
    pageSize?: number
    filter: {
      jlptLevelId: number
      search?: string
    }
  }) {
    return unwrapPage(
      http.post<ApiResponse<LessonDto[]>>('/api/lessons/pageable', {
        pageNumber: request.pageNumber ?? 1,
        pageSize: request.pageSize ?? 10,
        sortBy: 'id',
        sortOrder: 'ASC',
        filter: {
          jlptLevelId: request.filter.jlptLevelId,
          search: request.filter.search?.trim() || undefined,
        },
      }),
    )
  },

  get(id: number) {
    return unwrap(http.get<ApiResponse<LessonDetailDto>>(`/api/lessons/${id}`))
  },

  create(payload: CreateLessonPayload) {
    return unwrap(http.post<ApiResponse<LessonDetailDto>>('/api/lessons', payload))
  },

  update(id: number, payload: UpdateLessonPayload) {
    return unwrap(http.put<ApiResponse<LessonDetailDto>>(`/api/lessons/${id}`, payload))
  },

  setPublished(id: number, published: boolean) {
    return unwrap(
      http.put<ApiResponse<LessonDetailDto>>(`/api/lessons/${id}/published`, { published }),
    )
  },

  saveContent(id: number, payload: SaveLessonContentPayload) {
    return unwrap(http.put<ApiResponse<LessonDetailDto>>(`/api/lessons/${id}/content`, payload))
  },

  duplicate(id: number) {
    return unwrap(http.post<ApiResponse<LessonDetailDto>>(`/api/lessons/${id}/duplicate`))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<LessonDto>>(`/api/lessons/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<LessonDto>>(`/api/lessons/${id}/restore`))
  },

  batchUpload(params: { jlptLevelCode: string; file: File }) {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('jlptLevelCode', params.jlptLevelCode)
    return unwrap(
      http.post<ApiResponse<LessonBatchUploadResult>>('/api/lessons/batch-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    )
  },
}
