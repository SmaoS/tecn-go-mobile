import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { categoryFixture, userProfileFixture } from '../../../test/fixtures'
import { useServiceImagePicker } from '../../files/hooks'
import { useCurrentLocation } from '../../location/hooks'
import { useProfile } from '../../profile/hooks'
import { useCreateRequest, useServiceCategories } from '../hooks'
import { CreateRequestScreen } from './CreateRequestScreen'

jest.mock('../hooks', () => ({
  useServiceCategories: jest.fn(),
  useCreateRequest: jest.fn(),
}))
jest.mock('../../files/hooks', () => ({ useServiceImagePicker: jest.fn() }))
jest.mock('../../location/hooks', () => ({ useCurrentLocation: jest.fn() }))
jest.mock('../../profile/hooks', () => ({ useProfile: jest.fn() }))
jest.mock('../../location/LocationPickerModal', () => ({ LocationPickerModal: () => null }))

describe('CreateRequestScreen', () => {
  it('usa ciudad del perfil y coordenadas GPS al crear la solicitud', async () => {
    const mutate = jest.fn()
    const getCurrent = jest.fn(async () => ({
      latitude: 4.142,
      longitude: -73.626,
      address: 'Calle 10, 20-30, Centro, Villavicencio',
    }))
    jest.mocked(useServiceCategories).mockReturnValue({
      data: [categoryFixture()],
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useCreateRequest).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useServiceImagePicker).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    } as never)
    jest.mocked(useCurrentLocation).mockReturnValue({
      getCurrent,
      isLocating: false,
      error: '',
      clearError: jest.fn(),
    })
    jest.mocked(useProfile).mockReturnValue({
      data: userProfileFixture({
        cityId: 'city-villavicencio',
        cityName: 'Villavicencio',
      }),
    } as never)
    const navigation = { replace: jest.fn() }
    const view = render(<SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 24, right: 0, bottom: 34, left: 0 },
    }}>
      <CreateRequestScreen
        navigation={navigation as never}
        route={{ key: 'RequestService', name: 'RequestService' } as never}
      />
    </SafeAreaProvider>)

    await waitFor(() => expect(getCurrent).toHaveBeenCalled())
    expect(view.queryByText('Ciudad del servicio')).toBeNull()
    expect(view.queryByText('Ubicación del servicio')).toBeNull()
    expect(view.queryByText('Obtener ubicación GPS')).toBeNull()
    fireEvent.press(view.getByText('Electricista'))
    fireEvent.changeText(view.getByPlaceholderText('Describe el problema'), 'No hay energía')
    fireEvent.changeText(view.getByPlaceholderText('Presupuesto estimado (opcional)'), '100000')
    expect(view.getByDisplayValue('100.000')).toBeTruthy()
    fireEvent.changeText(view.getByPlaceholderText('Presupuesto estimado (opcional)'), '')
    expect(view.getByPlaceholderText('Presupuesto estimado (opcional)').props.value).toBe('')
    fireEvent.changeText(view.getByPlaceholderText('Presupuesto estimado (opcional)'), '100000')
    fireEvent.press(view.getByText('Efectivo'))
    expect(view.getByText('Cambiar medio de pago')).toBeTruthy()
    fireEvent.press(view.getByText('Crear solicitud'))

    expect(mutate).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        categoryId: 'category-electrician',
        cityId: 'city-villavicencio',
        description: 'No hay energía',
        address: 'Calle 10, 20-30, Centro, Villavicencio',
        latitude: 4.142,
        longitude: -73.626,
        estimatedPrice: 100000,
        paymentMethod: 'CASH',
      }),
      images: [],
    })
  })
})
