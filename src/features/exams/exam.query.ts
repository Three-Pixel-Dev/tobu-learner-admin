import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  examService,
  type CreateExamPayload,
  type ExamPageRequest,
  type UpdateExamPayload,
} from '@/shared/services/exam.service'

export const EXAM_QUERY_KEYS = {
  all: ['admin', 'exams'] as const,
  page: (request: ExamPageRequest) => [...EXAM_QUERY_KEYS.all, 'page', request] as const,
  detail: (id: number) => [...EXAM_QUERY_KEYS.all, 'detail', id] as const,
}

export function useExamPageQuery(request: ExamPageRequest, enabled = true) {
  return useQuery({
    queryKey: EXAM_QUERY_KEYS.page(request),
    queryFn: () => examService.page(request),
    enabled,
  })
}

export function useExamDetail(id?: number) {
  return useQuery({
    queryKey: EXAM_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => examService.getById(id!),
    enabled: Boolean(id && id > 0),
  })
}

export function useCreateExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamPayload) => examService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })
    },
  })
}

export function useUpdateExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExamPayload }) =>
      examService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(EXAM_QUERY_KEYS.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })
    },
  })
}

export function useDeleteExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => examService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })
    },
  })
}

export function useRestoreExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => examService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all })
    },
  })
}
