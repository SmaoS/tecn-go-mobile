import { api } from '../../api/client'

export type DataExport = {
  requestId: string
  generatedAt: string
  data: Record<string, unknown>
}

export const complianceApi = {
  exportMine: () => api.post<DataExport>('/v1/users/me/data-export').then(({ data }) => data),
  requestAnonymization: () =>
    api.post('/v1/users/me/data-anonymization', {
      reason: 'Solicitud realizada desde la aplicación móvil',
    }).then(({ data }) => data),
}
