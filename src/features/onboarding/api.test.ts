import { api } from '../../api/client'
import { onboardingApi } from './api'

jest.mock('../../api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}))

describe('onboardingApi', () => {
  beforeEach(() => jest.clearAllMocks())

  it('guarda los pasos de datos, selfie y documento', async () => {
    jest.mocked(api.put).mockResolvedValue({ data: {} })
    jest.mocked(api.post).mockResolvedValue({ data: { currentStep: 'IDENTITY_DOCUMENT' } })
    const main = {
      fullName: 'Cliente',
      phone: '3001234567',
      address: 'Calle 10',
      documentType: 'CC' as const,
      documentNumber: '123456789',
    }

    await onboardingApi.mainData(main)
    await onboardingApi.profileSelfie({
      profilePhotoUrl: '/private/selfie',
      faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
    })
    await onboardingApi.identityDocument({
      documentType: 'CC',
      documentFrontUrl: '/private/front',
      documentBackUrl: '/private/back',
      identityDocumentCaptureStatus: 'MANUAL_REVIEW_REQUIRED',
    })

    expect(api.put).toHaveBeenCalledWith('/v1/users/me/onboarding/main-data', main)
    expect(api.post).toHaveBeenCalledWith('/v1/users/me/onboarding/profile-selfie', {
      profilePhotoUrl: '/private/selfie',
      faceDetectionStatus: 'MANUAL_REVIEW_REQUIRED',
    })
    expect(api.post).toHaveBeenCalledWith('/v1/users/me/onboarding/identity-document',
      expect.objectContaining({ documentType: 'CC' }))
  })

  it('guarda perfil profesional y permite omitir certificado', async () => {
    jest.mocked(api.put).mockResolvedValue({ data: { currentStep: 'TECHNICIAN_CERTIFICATE' } })
    jest.mocked(api.post).mockResolvedValue({ data: {} })

    await onboardingApi.professionalProfile({
      categoryIds: ['category-1'],
      workExperienceDescription: 'Experiencia técnica residencial comprobada.',
    })
    await onboardingApi.skipCertificate()
    await onboardingApi.complete()

    expect(api.put).toHaveBeenCalledWith(
      '/v1/technicians/me/onboarding/professional-profile',
      expect.objectContaining({ categoryIds: ['category-1'] }),
    )
    expect(api.post).toHaveBeenCalledWith('/v1/technicians/me/onboarding/skip-certificate')
    expect(api.put).toHaveBeenCalledWith('/v1/users/me/onboarding/complete')
  })
})
