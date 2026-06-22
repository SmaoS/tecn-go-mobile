import { fireEvent, render } from '@testing-library/react-native'
import { TextInput } from 'react-native'
import { PasswordChangeModal } from './PasswordChangeModal'
import { useChangePassword } from '../hooks'
import { showToast } from '../../../components/Toast'

jest.mock('../hooks', () => ({ useChangePassword: jest.fn() }))
jest.mock('../../../components/Toast', () => ({ showToast: jest.fn() }))

describe('PasswordChangeModal', () => {
  const mutate = jest.fn()
  const reset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useChangePassword).mockReturnValue({
      mutate,
      reset,
      isPending: false,
      error: null,
    } as never)
  })

  it('blocks mismatched passwords and shows the validation message', () => {
    const view = render(<PasswordChangeModal visible onClose={jest.fn()} />)
    const fields = view.UNSAFE_getAllByType(TextInput)

    fireEvent.changeText(fields[0], 'Actual123!')
    fireEvent.changeText(fields[1], 'Nueva123!')
    fireEvent.changeText(fields[2], 'Otra123!')
    fireEvent.press(view.getByText('Actualizar contraseña'))

    expect(view.getByText('Las contraseñas no coinciden')).toBeTruthy()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits valid data, shows toast and closes the modal', () => {
    const onClose = jest.fn()
    mutate.mockImplementation((_form, options) => options.onSuccess({ message: 'Contraseña actualizada' }))
    const view = render(<PasswordChangeModal visible onClose={onClose} />)
    const fields = view.UNSAFE_getAllByType(TextInput)

    fireEvent.changeText(fields[0], 'Actual123!')
    fireEvent.changeText(fields[1], 'Nueva123!')
    fireEvent.changeText(fields[2], 'Nueva123!')
    fireEvent.press(view.getByText('Actualizar contraseña'))

    expect(mutate).toHaveBeenCalledWith({
      currentPassword: 'Actual123!',
      newPassword: 'Nueva123!',
      confirmPassword: 'Nueva123!',
    }, expect.any(Object))
    expect(showToast).toHaveBeenCalledWith('Contraseña actualizada')
    expect(onClose).toHaveBeenCalled()
  })

  it('clears mutation state when hidden', () => {
    const view = render(<PasswordChangeModal visible onClose={jest.fn()} />)
    view.rerender(<PasswordChangeModal visible={false} onClose={jest.fn()} />)
    expect(reset).toHaveBeenCalled()
  })
})
