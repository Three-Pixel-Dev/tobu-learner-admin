import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  examService,
  type CreateExamPayload,
  type ExamFilter,
  type UpdateExamPayload,
} from '@/shared/services/exam.service'

export const EXAM_QUERY_KEYS = {
  all: ['admin', 'exams'] as const,
  list: (filter?: ExamFilter, page?: number, size?: number) =>
    [...EXAM_QUERY_KEYS.all, 'list', filter, page, size] as const,
  detail: (id: number) => [...EXAM_QUERY_KEYS.all, 'detail', id] as const,
}

export function useExamList(filter?: ExamFilter, page = 0, size = 50) {
  return useQuery({
    queryKey: EXAM_QUERY_KEYS.list(filter, page, size),
    queryFn: () => examService.list(filter, page, size),
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
    onSuccess: () => {
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
