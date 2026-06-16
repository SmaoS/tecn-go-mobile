import { api } from '../../api/client'

export interface OnboardingStatus {
  emailVerified: boolean
  onboardingCompleted: boolean
  currentStep: 'MAIN_DATA' | 'LEGAL_ACCEPTANCE' | 'PROFILE_SELFIE' | 'IDENTITY_DOCUMENT' | 'TECHNICIAN_CERTIFICATE' | 'COMPLETED'
  requiredSteps: string[]
}

export const onboardingApi = {
  status: () => api.get<OnboardingStatus>('/v1/users/me/onboarding-status').then(({ data }) => data),
  resendEmail: () => api.post('/v1/auth/send-email-verification'),
}
