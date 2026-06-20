import { useMutation } from '@tanstack/react-query'
import type { Session } from '../../types'
import { authApi } from './api'

export const useLogin = (onSuccess: (session: Session) => void) => useMutation({
  mutationFn: ({ identifier, password, method }: { identifier: string; password: string; method: 'email' | 'phone' }) => authApi.login(identifier, password, method),
  onSuccess,
})
export const useRegister = (onSuccess: (session: Session) => void) => useMutation({
  mutationFn: (payload: { fullName: string; email: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) => authApi.register(payload),
  onSuccess,
})
export const useRegisterByPhone = (onSuccess: (session: Session) => void) => useMutation({
  mutationFn: (payload: { fullName: string; phone: string; verificationToken: string; password: string; confirmPassword: string; role: 'CLIENT' | 'TECHNICIAN'; referralCode?: string }) => authApi.registerByPhone(payload),
  onSuccess,
})
export const useSendPhoneOtp = () => useMutation({ mutationFn: authApi.sendPhoneOtp })
export const useVerifyPhoneOtp = () => useMutation({
  mutationFn: ({ phone, code }: { phone: string; code: string }) => authApi.verifyPhoneOtp(phone, code),
})
export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword })
export const useResetPassword = () => useMutation({ mutationFn: authApi.resetPassword })
