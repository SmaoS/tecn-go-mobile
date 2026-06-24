import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ratingsApi } from './api'

export const ratingStatusKey = (requestId: string) => ['ratings', 'status', requestId] as const

export function useRatingStatus(requestId: string, enabled = true) {
  return useQuery({ queryKey: ratingStatusKey(requestId), queryFn: () => ratingsApi.status(requestId), enabled })
}

export function useRatingStatuses(requestIds: string[]) {
  return useQuery({
    queryKey: ['ratings', 'statuses', ...requestIds],
    enabled: requestIds.length > 0,
    queryFn: async () => Object.fromEntries(await Promise.all(
      requestIds.map(async (id) => [id, (await ratingsApi.status(id)).rated] as const),
    )),
  })
}

export function useTechnicianRatings(technicianUserId?: string) {
  return useQuery({
    queryKey: ['ratings', 'technician', technicianUserId],
    enabled: Boolean(technicianUserId),
    queryFn: () => ratingsApi.technicianRatings(technicianUserId!),
  })
}

export function useSubmitRating(onSuccess: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ requestId, score, comment }: { requestId: string; score: number; comment: string }) =>
      ratingsApi.create(requestId, score, comment).then(() => requestId),
    onSuccess: async (requestId) => {
      await client.invalidateQueries({ queryKey: ['ratings'] })
      await client.invalidateQueries({ queryKey: ratingStatusKey(requestId) })
      onSuccess()
    },
  })
}
