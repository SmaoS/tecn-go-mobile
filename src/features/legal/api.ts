import { api } from '../../api/client'
export interface LegalDocument { id: string; title: string; version: string; content: string; accepted: boolean }
export const legalApi = {
  active: () => api.get<LegalDocument[]>('/v1/legal/documents/active').then(({ data }) => data),
  accept: (id: string) => api.post(`/v1/legal/documents/${id}/accept`),
}
