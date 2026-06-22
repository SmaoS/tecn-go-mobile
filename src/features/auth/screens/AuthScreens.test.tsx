import { act, fireEvent, render } from '@testing-library/react-native'
import { LoginScreen, RegisterScreen } from './AuthScreens'
import {
  useLogin,
  useRegister,
  useRegisterByPhone,
  useSendPhoneOtp,
  useVerifyAdminMfa,
  useVerifyPhoneOtp,
} from '../hooks'
import { checkAppVersionBeforeLogin } from '../../app-version/AppVersionGate'

jest.mock('../hooks', () => ({
  useLogin: jest.fn(),
  useVerifyAdminMfa: jest.fn(),
  useRegister: jest.fn(),
  useRegisterByPhone: jest.fn(),
  useSendPhoneOtp: jest.fn(),
  useVerifyPhoneOtp: jest.fn(),
  useForgotPassword: jest.fn(),
  useResetPassword: jest.fn(),
}))
jest.mock('../../app-version/AppVersionGate', () => ({
  checkAppVersionBeforeLogin: jest.fn(async () => undefined),
  AppVersionModal: () => null,
}))
jest.mock('../api', () => ({ authApi: { validateReferral: jest.fn() } }))

const mutation = () => ({
  mutate: jest.fn(),
  isPending: false,
  error: null,
})

describe('auth screens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useLogin).mockReturnValue(mutation() as never)
    jest.mocked(useVerifyAdminMfa).mockReturnValue(mutation() as never)
    jest.mocked(useRegister).mockReturnValue(mutation() as never)
    jest.mocked(useRegisterByPhone).mockReturnValue(mutation() as never)
    jest.mocked(useSendPhoneOtp).mockReturnValue(mutation() as never)
    jest.mocked(useVerifyPhoneOtp).mockReturnValue(mutation() as never)
  })

  it('mantiene bloqueado login hasta ingresar identificador y contraseña', async () => {
    const login = mutation()
    jest.mocked(useLogin).mockReturnValue(login as never)
    const navigation = { navigate: jest.fn() }
    const view = render(<LoginScreen
      navigation={navigation as never}
      route={{ key: 'Login', name: 'Login' } as never}
      onSession={jest.fn()}
    />)

    await act(async () => { fireEvent.press(view.getByText('Ingresar')) })
    expect(login.mutate).not.toHaveBeenCalled()

    fireEvent.changeText(view.getByPlaceholderText('Correo'), 'client@test.local')
    fireEvent.changeText(view.getByPlaceholderText('Contraseña'), 'Secret123!')
    await act(async () => { fireEvent.press(view.getByText('Ingresar')) })

    expect(checkAppVersionBeforeLogin).toHaveBeenCalled()
  })

  it('bloquea registro celular hasta verificar OTP', () => {
    const registerPhone = mutation()
    jest.mocked(useRegisterByPhone).mockReturnValue(registerPhone as never)
    const view = render(<RegisterScreen
      navigation={{ navigate: jest.fn() } as never}
      route={{ key: 'Register', name: 'Register' } as never}
      onSession={jest.fn()}
    />)

    fireEvent.press(view.getByText('Celular'))
    fireEvent.changeText(view.getByPlaceholderText('Nombre completo'), 'Cliente Test')
    fireEvent.changeText(view.getByPlaceholderText('Celular, ej. 3001234567'), '3001234567')
    fireEvent.changeText(view.getByPlaceholderText('Contraseña'), 'Secret123!')
    fireEvent.changeText(view.getByPlaceholderText('Confirmar contraseña'), 'Secret123!')
    fireEvent.press(view.getByText('Registrarme'))

    expect(registerPhone.mutate).not.toHaveBeenCalled()
  })
})
