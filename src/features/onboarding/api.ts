import { api } from '../../api/client'

export interface OnboardingStatus {
  emailVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
  requiredSteps: string[]
  nextScreen?: 'HOME'
}

export type DocumentType = 'CC' | 'PASSPORT'
export type FaceDetectionStatus = 'AUTO_VALIDATED' | 'MANUAL_REVIEW_REQUIRED' | 'FAILED'
export type IdentityDocumentCaptureStatus = 'AUTO_CAPTURED' | 'MANUAL_CAPTURED' | 'MANUAL_REVIEW_REQUIRED'

export interface OnboardingMainData {
  fullName: string
  phone?: string
  countryId?: string
  departmentId?: string
  cityId?: string
  address: string
  neighborhood?: string
  documentType: DocumentType
  documentNumber: string
}

export type IdentityDocumentPayload =
  | { documentType: 'CC'; documentFrontUrl: string; documentBackUrl: string; identityDocumentCaptureStatus?: IdentityDocumentCaptureStatus }
  | { documentType: 'PASSPORT'; documentSingleUrl: string; identityDocumentCaptureStatus?: IdentityDocumentCaptureStatus }

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/v1/users/me/onboarding-status').then(({ data }) => data),
  resendEmail: () => api.post('/v1/auth/send-email-verification'),
  mainData: (payload: OnboardingMainData) => api.put('/v1/users/me/onboarding/main-data', payload),
  legalAcceptance: () => api.post('/v1/users/me/onboarding/legal-acceptance'),
  profileSelfie: (payload: { profilePhotoUrl: string; faceDetectionStatus?: FaceDetectionStatus }) => api.post<OnboardingStatus>('/v1/users/me/onboarding/profile-selfie', payload).then(({ data }) => data),
  identityDocument: (payload: IdentityDocumentPayload) => api.post('/v1/users/me/onboarding/identity-document', payload),
  certificate: (certificateUrl: string) => api.post('/v1/technicians/me/onboarding/certificate', { certificateUrl }),
  skipCertificate: () => api.post('/v1/technicians/me/onboarding/skip-certificate'),
  complete: () => api.put('/v1/users/me/onboarding/complete'),
  autoComplete: () => api.post<OnboardingStatus>('/v1/users/me/onboarding/auto-complete').then(({ data }) => data),
}
