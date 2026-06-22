import { api } from '../../api/client'
import { setStoredSession } from '../../services/sessionStorage'
import { sessionFixture } from '../../test/fixtures'
import { authApi } from './api'

jest.mock('../../api/client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))
jest.mock('../../services/sessionStorage', () => ({ setStoredSession: jest.fn() }))

describe('authApi', () => {
  beforeEach(() => jest.clearAllMocks())

  it('persiste login normal pero espera MFA para cuentas administrativas', async () => {
    const session = sessionFixture()
    jest.mocked(api.post).mockResolvedValueOnce({ data: session })

    await expect(authApi.login('client@test.local', 'Secret123!', 'email'))
      .resolves.toEqual(session)
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
      email: 'client@test.local',
      password: 'Secret123!',
    })
    expect(setStoredSession).toHaveBeenCalledWith(JSON.stringify(session))

    jest.clearAllMocks()
    const challenge = {
      ...sessionFixture({ role: 'ADMIN' }),
      mfaRequired: true,
      mfaChallengeToken: 'challenge-1',
    }
    jest.mocked(api.post).mockResolvedValueOnce({ data: challenge })
    await authApi.login('admin@test.local', 'Secret123!', 'email')
    expect(setStoredSession).not.toHaveBeenCalled()
  })

  it('usa endpoint celular y persiste registro después de verificar OTP', async () => {
    const session = sessionFixture({ phoneVerified: true, email: undefined })
    jest.mocked(api.post).mockResolvedValue({ data: session })

    await authApi.login('3001234567', 'Secret123!', 'phone')
    expect(api.post).toHaveBeenCalledWith('/v1/auth/login-by-phone', {
      phone: '3001234567',
      password: 'Secret123!',
    })

    await authApi.registerByPhone({
      fullName: 'Cliente',
      phone: '3001234567',
      verificationToken: 'verified-token',
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
      role: 'CLIENT',
    })
    expect(setStoredSession).toHaveBeenCalledWith(JSON.stringify(session))
  })

  it('envía y verifica OTP con los payloads esperados', async () => {
    jest.mocked(api.post)
      .mockResolvedValueOnce({ data: { message: 'Enviado', debugCode: '00000' } })
      .mockResolvedValueOnce({ data: { verified: true, verificationToken: 'token-1' } })

    await expect(authApi.sendPhoneOtp('3001234567')).resolves.toEqual({
      message: 'Enviado',
      debugCode: '00000',
    })
    await expect(authApi.verifyPhoneOtp('3001234567', '00000')).resolves.toEqual({
      verified: true,
      verificationToken: 'token-1',
    })
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/v1/auth/phone/send-otp',
      { phone: '3001234567' },
    )
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/v1/auth/phone/verify-otp',
      { phone: '3001234567', code: '00000' },
    )
  })
})
