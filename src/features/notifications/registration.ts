import { api } from '../../api/client'

export const pushRegistrationApi = {
  register: (token: string) => api.put('/v1/users/me/fcm-token', { token }),
}
