import { act, render } from '@testing-library/react-native'
import { showToast, ToastHost } from './Toast'

describe('ToastHost', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers())
    jest.useRealTimers()
  })

  it('shows messages sent after mounting and hides them automatically', () => {
    const view = render(<ToastHost />)

    act(() => showToast('Perfil actualizado', 'success'))
    expect(view.getByText('Perfil actualizado')).toBeTruthy()

    act(() => jest.advanceTimersByTime(3200))
    expect(view.queryByText('Perfil actualizado')).toBeNull()
  })

  it('replaces the current toast with the latest message', () => {
    const view = render(<ToastHost />)

    act(() => {
      showToast('Primer mensaje', 'info')
      showToast('No fue posible guardar', 'error')
    })

    expect(view.queryByText('Primer mensaje')).toBeNull()
    expect(view.getByText('No fue posible guardar')).toBeTruthy()
  })
})
