import { api } from '../../api/client'
import type { UserProfile } from '../../types'

export const profileApi = {
  me: () => api.get<UserProfile>('/v1/users/me/profile').then(({ data }) => data),
  save: (profile: UserProfile) => api.put<UserProfile>('/v1/users/me/profile', profile).then(({ data }) => data),
  verifyEmail: () => api.post('/v1/auth/send-email-verification'),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ message: string }>('/v1/users/me/change-password', payload).then(({ data }) => data),
}
