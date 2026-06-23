import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { legalApi } from './api'
export function useLegalDocuments() {
  const client = useQueryClient()
  const documents = useQuery({ queryKey: ['legal'], queryFn: legalApi.active })
  const acceptAll = useMutation({
    mutationFn: legalApi.acceptAll,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['legal'] }),
        client.invalidateQueries({ queryKey: ['onboarding-status'] }),
      ])
    },
  })
  return { documents, acceptAll }
}
