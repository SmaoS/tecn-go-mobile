import { useMutation } from '@tanstack/react-query'
import { ratingsApi } from './api'
export const useSubmitRating = (onSuccess: () => void) => useMutation({
  mutationFn: ({ requestId, score, comment }: { requestId: string; score: number; comment: string }) =>
    ratingsApi.create(requestId, score, comment),
  onSuccess,
})
