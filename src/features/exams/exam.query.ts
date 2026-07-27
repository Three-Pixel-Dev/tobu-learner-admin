import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  examService,
  type CreateExamPayload,
  type ExamFilter,
  type UpdateExamPayload,
} from '@/shared/services/exam.service'

const EXAM_PAGE_SIZE = 12

export const EXAM_QUERY_KEYS = {
  all: ['admin', 'exams'] as const,
  infinite: (filter: ExamFilter) => [...EXAM_QUERY_KEYS.all, 'infinite', filter] as const,
  detail: (id: number) => [...EXAM_QUERY_KEYS.all, 'detail', id] as const,
}

export function useExamsInfiniteQuery(filter: ExamFilter, enabled = true) {
  return useInfiniteQuery({
    queryKey: EXAM_QUERY_KEYS.infinite(filter),
    queryFn: ({ pageParam }) =>
      examService.page({
        pageNumber: pageParam,
        pageSize: EXAM_PAGE_SIZE,
        filter,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const page = last.meta.page || 1
      const totalPages = last.meta.totalPages || 0
      return page < totalPages ? page + 1 : undefined
    },
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
