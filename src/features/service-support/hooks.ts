import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceSupportApi } from './api'

export const useServiceSupport = (requestId: string) => {
  const client = useQueryClient()
  const evidences = useQuery({ queryKey: ['service-evidence', requestId], queryFn: () => serviceSupportApi.evidences(requestId) })
  const proofs = useQuery({ queryKey: ['payment-proofs', requestId], queryFn: () => serviceSupportApi.proofs(requestId) })
  const action = useMutation({
    mutationFn: async (input:
      | { kind: 'evidence'; evidenceType: import('./api').EvidenceType; description: string }
      | { kind: 'proof'; amount: number; paymentMethod: import('./api').ProofMethod }
      | { kind: 'report'; description: string }) => {
      if (input.kind === 'evidence') await serviceSupportApi.uploadEvidence(requestId, input.evidenceType, input.description)
      else if (input.kind === 'proof') await serviceSupportApi.uploadProof(requestId, input.amount, input.paymentMethod)
      else await serviceSupportApi.report(requestId, 'OTHER', input.description)
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['service-evidence', requestId] })
      void client.invalidateQueries({ queryKey: ['payment-proofs', requestId] })
    },
  })
  return { evidences, proofs, action }
}
