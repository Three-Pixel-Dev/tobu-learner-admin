export interface KanjiDto {
  id: number
  character: string
  jlptLevelId: number
  jlptLevelCode?: string
  meaningMm?: string
  meaningEn?: string
  onyomi?: string
  kunyomi?: string
  strokeCount?: number
  strokeOrderJson?: Record<string, any>
  audioUrl?: string
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateKanjiInput {
  character: string
  jlptLevelId: number
  meaningMm?: string
  meaningEn?: string
  onyomi?: string
  kunyomi?: string
  strokeCount?: number
  strokeOrderJson?: Record<string, any>
  audioUrl?: string
}

export interface UpdateKanjiInput extends CreateKanjiInput {}

export interface KanjiFilter {
  jlptLevelId?: number
  levelCode?: string
  search?: string
  includeDisabled?: boolean
}
