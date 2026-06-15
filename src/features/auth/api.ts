import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, SESSION_KEY } from '../../api/client'
import type { Session } from '../../types'

async function persist(response: Promise<{ data: Session }>) {
  const { data } = await response
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data))
  return data
}

export const authApi = {
  login: (email: string, password: string) =>
    persist(api.post<Session>('/v1/auth/login', { email, password })),
  register: (payload: { fullName: string; email: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) =>
    persist(api.post<Session>('/v1/auth/register', payload)),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/v1/auth/forgot-password', { email }).then(({ data }) => data),
  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ message: string }>('/v1/auth/reset-password', payload).then(({ data }) => data),
  validateReferral: (code: string) =>
    api.get<{ valid: boolean; technicianName?: string; message: string }>(`/v1/referrals/validate/${encodeURIComponent(code)}`).then(({ data }) => data),
}
