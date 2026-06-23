import { api } from '../../api/client'
import type { Session } from '../../types'
import { setStoredSession } from '../../services/sessionStorage'

export function normalizeSession<T extends Session>(data: T): T {
  if (data.activeMode && (data.activeMode === 'CLIENT' || data.activeMode === 'TECHNICIAN')) {
    return { ...data, role: data.activeMode }
  }
  return data
}

async function persist(response: Promise<{ data: Session }>) {
  const responseData = await response
  const data = normalizeSession(responseData.data)
  await setStoredSession(JSON.stringify(data))
  return data
}

export type LoginResult = Session & {
  mfaRequired?: boolean
  mfaChallengeToken?: string
  mfaExpiresAt?: string
}

export type PhoneOtpPayload = {
  phone: string
  countryId?: string
}

function phoneOtpBody(payload: string | PhoneOtpPayload) {
  return typeof payload === 'string' ? { phone: payload } : payload
}

function verifyPhoneOtpBody(phone: string, code: string, countryId?: string) {
  return countryId ? { phone, code, countryId } : { phone, code }
}

async function login(response: Promise<{ data: LoginResult }>) {
  const responseData = await response
  const data = normalizeSession(responseData.data)
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
  sendPhoneOtp: (payload: string | PhoneOtpPayload) =>
    api.post<{ message: string; debugCode?: string }>('/v1/auth/phone/send-otp', phoneOtpBody(payload)).then(({ data }) => data),
  verifyPhoneOtp: (phone: string, code: string, countryId?: string) =>
    api.post<{ verified: boolean; verificationToken: string }>('/v1/auth/phone/verify-otp', verifyPhoneOtpBody(phone, code, countryId)).then(({ data }) => data),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/v1/auth/forgot-password', { email }).then(({ data }) => data),
  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ message: string }>('/v1/auth/reset-password', payload).then(({ data }) => data),
  validateReferral: (code: string) =>
    api.get<{ valid: boolean; technicianName?: string; message: string }>(`/v1/referrals/validate/${encodeURIComponent(code)}`).then(({ data }) => data),
}
