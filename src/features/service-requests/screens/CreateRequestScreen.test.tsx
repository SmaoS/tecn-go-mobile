import { fireEvent, render, waitFor } from '@testing-library/react-native'
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
    const getCurrent = jest.fn(async () => ({ latitude: 4.142, longitude: -73.626 }))
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
    const view = render(<CreateRequestScreen
      navigation={navigation as never}
      route={{ key: 'RequestService', name: 'RequestService' } as never}
    />)

    await waitFor(() => expect(getCurrent).toHaveBeenCalled())
    fireEvent.press(view.getByText('Electricista'))
    fireEvent.changeText(view.getByPlaceholderText('Describe el problema'), 'No hay energía')
    fireEvent.changeText(view.getByPlaceholderText('Dirección'), 'Calle 10 # 20-30')
    fireEvent.changeText(view.getByPlaceholderText('Presupuesto estimado (opcional)'), '100000')
    fireEvent.press(view.getByText('Crear solicitud'))

    expect(mutate).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        categoryId: 'category-electrician',
        cityId: 'city-villavicencio',
        description: 'No hay energía',
        address: 'Calle 10 # 20-30',
        latitude: 4.142,
        longitude: -73.626,
        estimatedPrice: 100000,
        paymentMethod: 'CASH',
      }),
      images: [],
    })
  })
})
