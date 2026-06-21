import { api } from '../../api/client'
import type { Session } from '../../types'
import { setStoredSession } from '../../services/sessionStorage'

async function persist(response: Promise<{ data: Session }>) {
  const { data } = await response
  await setStoredSession(JSON.stringify(data))
  return data
}

export type LoginResult = Session & {
  mfaRequired?: boolean
  mfaChallengeToken?: string
  mfaExpiresAt?: string
}

async function login(response: Promise<{ data: LoginResult }>) {
  const { data } = await response
  if (!data.mfaRequired) await setStoredSession(JSON.stringify(data))
  return data
}

export const authApi = {
  login: (identifier: string, password: string, method: 'email' | 'phone') =>
    login(api.post<LoginResult>(method === 'email' ? '/v1/auth/login' : '/v1/auth/login-by-phone',
      method === 'email' ? { email: identifier, password } : { phone: identifier, password })),
  verifyAdminMfa: (challengeToken: string, code: string) =>
    persist(api.post<Session>('/v1/auth/mfa/verify', { challengeToken, code })),
  register: (payload: { fullName: string; email: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) =>
    persist(api.post<Session>('/v1/auth/register', payload)),
  registerByPhone: (payload: { fullName: string; phone: string; verificationToken: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) =>
    persist(api.post<Session>('/v1/auth/register-by-phone', payload)),
  sendPhoneOtp: (phone: string) =>
    api.post<{ message: string; debugCode?: string }>('/v1/auth/phone/send-otp', { phone }).then(({ data }) => data),
  verifyPhoneOtp: (phone: string, code: string) =>
    api.post<{ verified: boolean; verificationToken: string }>('/v1/auth/phone/verify-otp', { phone, code }).then(({ data }) => data),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/v1/auth/forgot-password', { email }).then(({ data }) => data),
  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ message: string }>('/v1/auth/reset-password', payload).then(({ data }) => data),
  validateReferral: (code: string) =>
    api.get<{ valid: boolean; technicianName?: string; message: string }>(`/v1/referrals/validate/${encodeURIComponent(code)}`).then(({ data }) => data),
}
