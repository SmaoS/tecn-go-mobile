import { useMutation } from '@tanstack/react-query'
import type { Session } from '../../types'
import { authApi } from './api'

export const useLogin = (onSuccess: (session: Session) => void) => useMutation({
  mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
  onSuccess,
})
export const useRegister = (onSuccess: (session: Session) => void) => useMutation({
  mutationFn: (payload: { fullName: string; email: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) => authApi.register(payload),
  onSuccess,
})
export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword })
export const useResetPassword = () => useMutation({ mutationFn: authApi.resetPassword })
