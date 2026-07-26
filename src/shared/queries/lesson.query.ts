import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  lessonService,
  type CreateLessonPayload,
  type SaveLessonContentPayload,
  type UpdateLessonPayload,
} from '@/shared/services/lesson.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const lessonKeys = {
  all: ['lessons'] as const,
  list: (jlptLevelId: number, search: string, page: number, size: number) =>
    [...lessonKeys.all, 'list', jlptLevelId, search, page, size] as const,
  detail: (id: number) => [...lessonKeys.all, 'detail', id] as const,
}

export function useLessonsQuery(
  jlptLevelId: number | null,
  search: string,
  pageNumber: number,
  pageSize: number,
) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: lessonKeys.list(jlptLevelId ?? 0, search, pageNumber, pageSize),
    queryFn: () =>
      lessonService.list({
        jlptLevelId: jlptLevelId!,
        search,
        pageNumber,
        pageSize,
      }),
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
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLessonPayload }) =>
      lessonService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetLessonPublishedMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      lessonService.setPublished(id, published),
    onSuccess: invalidate,
  })
}

export function useSaveLessonContentMutation() {
  const invalidate = useInvalidateLessons()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveLessonContentPayload }) =>
      lessonService.saveContent(id, payload),
    onSuccess: invalidate,
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
