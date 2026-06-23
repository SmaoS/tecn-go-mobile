import * as DocumentPicker from 'expo-document-picker'
import { api } from '../../api/client'

export type EvidenceType = 'BEFORE_SERVICE' | 'DURING_SERVICE' | 'AFTER_SERVICE' | 'DAMAGE_REPORT' | 'OTHER'
export type ProofMethod = 'CASH' | 'TRANSFER' | 'WOMPI' | 'MERCADO_PAGO' | 'PAYU' | 'OTHER'
export interface ServiceEvidence {
  id: string
  uploadedByName: string
  evidenceType: EvidenceType
  fileUrl: string
  contentAssetId?: string
  moderationStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  description?: string
}
export interface PaymentProof {
  id: string
  amount: number
  paymentMethod: ProofMethod
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  fileUrl: string
  contentAssetId?: string
  moderationStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  reviewComment?: string
}

type UploadFile = { uri: string; name: string; mimeType: string }

async function pickFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    copyToCacheDirectory: true,
  })
  if (result.canceled) return undefined
  const file = result.assets[0]
  return file ? { uri: file.uri, name: file.name, mimeType: file.mimeType ?? 'application/pdf' } : undefined
}

function fileBody(file: UploadFile) {
  const body = new FormData()
  body.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
  return body
}

export const serviceSupportApi = {
  evidences: (requestId: string) => api.get<ServiceEvidence[]>(`/v1/service-requests/${requestId}/evidences`).then(({ data }) => data),
  proofs: (requestId: string) => api.get<PaymentProof[]>(`/v1/service-requests/${requestId}/payment-proofs`).then(({ data }) => data),
  uploadEvidence: async (requestId: string, evidenceType: EvidenceType, description: string) => {
    const file = await pickFile()
    if (!file) return
    await serviceSupportApi.uploadEvidenceFile(requestId, evidenceType, description, file)
  },
  uploadEvidenceFile: async (requestId: string, evidenceType: EvidenceType, description: string, file: UploadFile) => {
    const body = fileBody(file)
    body.append('evidenceType', evidenceType)
    if (description) body.append('description', description)
    await api.post(`/v1/service-requests/${requestId}/evidences`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  uploadProof: async (requestId: string, amount: number, paymentMethod: ProofMethod) => {
    const file = await pickFile()
    if (!file) return
    const body = fileBody(file)
    body.append('amount', String(amount))
    body.append('paymentMethod', paymentMethod)
    await api.post(`/v1/service-requests/${requestId}/payment-proofs`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  report: (requestId: string, reason: string, description: string) =>
    api.post(`/v1/service-requests/${requestId}/reports`, { reason, description, severity: 'MEDIUM' }),
  reportContent: (contentAssetId: string, reason: string) =>
    api.post(`/v1/content/${contentAssetId}/report`, { reason }),
}
