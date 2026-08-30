import { useMutation, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  lessonService,
  type CreateLessonPayload,
  type SaveLessonContentPayload,
  type UpdateLessonPayload,
} from '@/shared/services/lesson.service'
import { useAuthStore } from '@/shared/stores/auth.store'

const LESSON_PAGE_SIZE = 20

export const lessonKeys = {
  all: ['lessons'] as const,
  infinite: (jlptLevelId: number, search: string, includeDisabled = false) =>
    [...lessonKeys.all, 'infinite', jlptLevelId, search, includeDisabled] as const,
  detail: (id: number) => [...lessonKeys.all, 'detail', id] as const,
}

export function useLessonsInfiniteQuery(
  jlptLevelId: number | null,
  search: string,
  includeDisabled = false,
) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useInfiniteQuery({
    queryKey: lessonKeys.infinite(jlptLevelId ?? 0, search.trim(), includeDisabled),
    queryFn: ({ pageParam }) =>
      lessonService.page({
        pageNumber: pageParam,
        pageSize: LESSON_PAGE_SIZE,
        filter: {
          jlptLevelId: jlptLevelId!,
          search: search.trim() || undefined,
          includeDisabled,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const page = last.meta.page || 1
      const totalPages = last.meta.totalPages || 0
      return page < totalPages ? page + 1 : undefined
    },
    enabled: Boolean(accessToken) && jlptLevelId != null,
  })
}

export function useLessonDetailQuery(id: number | null) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: lessonKeys.detail(id ?? 0),
    queryFn: () => lessonService.get(id!),
    enabled: Boolean(accessToken) && id != null && id > 0,
  })
}

function useInvalidateLessons() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: lessonKeys.all })
  }
}

export function useCreateLessonMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (payload: CreateLessonPayload) => lessonService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateLessonMutation() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLessonPayload }) =>
      lessonService.update(id, payload),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(lessonKeys.detail(id), updated)
      invalidate()
    },
  })
}

export function useSetLessonPublishedMutation() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      lessonService.setPublished(id, published),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(lessonKeys.detail(id), updated)
      invalidate()
    },
  })
}

export function useSaveLessonContentMutation() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveLessonContentPayload }) =>
      lessonService.saveContent(id, payload),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(lessonKeys.detail(id), updated)
      invalidate()
    },
  })
}

export function useDuplicateLessonMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (id: number) => lessonService.duplicate(id),
    onSuccess: invalidate,
  })
}

export function useSoftDeleteLessonMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (id: number) => lessonService.softDelete(id),
    onSuccess: invalidate,
  })
}

export function useRestoreLessonMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (id: number) => lessonService.restore(id),
    onSuccess: invalidate,
  })
}

export function usePermanentDeleteLessonMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (id: number) => lessonService.permanentDelete(id),
    onSuccess: invalidate,
  })
}

export function useUploadLessonsBatchMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: (params: { jlptLevelCode: string; file: File }) => lessonService.batchUpload(params),
    onSuccess: invalidate,
  })
}

export function useUploadLessonAudioZipMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => lessonService.uploadAudioZip(id, file),
    onSuccess: invalidate,
  })
}

export function useUploadLevelLessonsAudioZipMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ jlptLevelCode, file }: { jlptLevelCode: string; file: File }) =>
      lessonService.uploadLevelAudioZip(jlptLevelCode, file),
    onSuccess: invalidate,
  })
}
