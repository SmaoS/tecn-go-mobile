import { api } from '../../api/client'

export interface OnboardingStatus {
  emailVerified: boolean
  phoneVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_PROFESSIONAL_PROFILE' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
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
  updateEmail: (payload: { email: string; confirmEmail: string }) =>
    api.put<{ message: string; email: string; emailVerified: boolean }>('/v1/auth/email', payload).then(({ data }) => data),
  mainData: (payload: OnboardingMainData) =>
    api.put<OnboardingStatus>('/v1/users/me/onboarding/main-data', payload).then(({ data }) => data),
  legalAcceptance: () => api.post('/v1/users/me/onboarding/legal-acceptance'),
  profileSelfie: (payload: { profilePhotoUrl: string; faceDetectionStatus?: FaceDetectionStatus }) => api.post<OnboardingStatus>('/v1/users/me/onboarding/profile-selfie', payload).then(({ data }) => data),
  identityDocument: (payload: IdentityDocumentPayload) =>
    api.post<OnboardingStatus>('/v1/users/me/onboarding/identity-document', payload).then(({ data }) => data),
  professionalProfile: (payload: { categoryIds: string[]; workExperienceDescription: string }) =>
    api.put<OnboardingStatus>('/v1/technicians/me/onboarding/professional-profile', payload).then(({ data }) => data),
  certificate: (certificateUrl: string) =>
    api.post<OnboardingStatus>('/v1/technicians/me/onboarding/certificate', { certificateUrl }).then(({ data }) => data),
  skipCertificate: () => api.post<OnboardingStatus>('/v1/technicians/me/onboarding/skip-certificate').then(({ data }) => data),
  complete: () => api.put<OnboardingStatus>('/v1/users/me/onboarding/complete').then(({ data }) => data),
  autoComplete: () => api.post<OnboardingStatus>('/v1/users/me/onboarding/auto-complete').then(({ data }) => data),
}
