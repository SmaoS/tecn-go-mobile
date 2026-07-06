import { api } from '../../api/client'

export type DataRequestStatus = 'PENDING' | 'APPROVED' | 'SENT' | 'COMPLETED' | 'REJECTED'

export type ProfileSelfieChangeRequest = {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userRole: 'CLIENT' | 'TECHNICIAN' | 'VERIFIER' | 'ADMIN'
  currentPhotoUrl?: string
  requestedPhotoUrl: string
  faceDetectionStatus?: 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  reviewedByUserId?: string
  reviewedAt?: string
  rejectionReason?: string
}

export type DataRequest = {
  id: string
  userId: string
  userName: string
  type: 'EXPORT' | 'ANONYMIZATION'
  status: DataRequestStatus
  reason?: string
  requestedAt: string
  completedAt?: string
  reviewedAt?: string
  rejectionReason?: string
  exportFileUrl?: string
  sentAt?: string
}

export const complianceApi = {
  requestExport: () => api.post<DataRequest>('/v1/users/me/data-export-request').then(({ data }) => data),
  exportRequests: () => api.get<DataRequest[]>('/v1/users/me/data-export-requests').then(({ data }) => data),
  exportMine: () => api.post<DataRequest>('/v1/users/me/data-export-request').then(({ data }) => data),
  requestAnonymization: () =>
    api.post('/v1/users/me/data-anonymization', {
      reason: 'Solicitud realizada desde la aplicación móvil',
    }).then(({ data }) => data),
  requestProfileSelfieChange: (profilePhotoUrl: string) =>
    api.post<ProfileSelfieChangeRequest>('/v1/users/me/profile-selfie-change-requests', {
      profilePhotoUrl,
      faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
    }).then(({ data }) => data),
  profileSelfieChangeRequests: () =>
    api.get<ProfileSelfieChangeRequest[]>('/v1/users/me/profile-selfie-change-requests').then(({ data }) => data),
}
