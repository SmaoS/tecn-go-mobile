import { api } from '../../api/client'

export interface OnboardingStatus {
  emailVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
  requiredSteps: string[]
}

export type DocumentType = 'CC' | 'PASSPORT'

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
  | { documentType: 'CC'; documentFrontUrl: string; documentBackUrl: string }
  | { documentType: 'PASSPORT'; documentSingleUrl: string }

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/v1/users/me/onboarding-status').then(({ data }) => data),
  resendEmail: () => api.post('/v1/auth/send-email-verification'),
  mainData: (payload: OnboardingMainData) => api.put('/v1/users/me/onboarding/main-data', payload),
  legalAcceptance: () => api.post('/v1/users/me/onboarding/legal-acceptance'),
  profileSelfie: (profilePhotoUrl: string) => api.post('/v1/users/me/onboarding/profile-selfie', { profilePhotoUrl }),
  identityDocument: (payload: IdentityDocumentPayload) => api.post('/v1/users/me/onboarding/identity-document', payload),
  certificate: (certificateUrl: string) => api.post('/v1/technicians/me/onboarding/certificate', { certificateUrl }),
  skipCertificate: () => api.post('/v1/technicians/me/onboarding/skip-certificate'),
  complete: () => api.put('/v1/users/me/onboarding/complete'),
}
