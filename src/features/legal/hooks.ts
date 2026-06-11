import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { legalApi } from './api'
export function useLegalDocuments() {
  const client = useQueryClient()
  const documents = useQuery({ queryKey: ['legal'], queryFn: legalApi.active })
  const accept = useMutation({ mutationFn: legalApi.accept, onSuccess: () => void client.invalidateQueries({ queryKey: ['legal'] }) })
  return { documents, accept }
}
