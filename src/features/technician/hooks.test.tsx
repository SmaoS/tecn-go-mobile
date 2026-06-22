import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as Location from 'expo-location'
import { createQueryWrapper } from '../../test/render'
import { technicianProfileFixture } from '../../test/fixtures'
import { requestKeys } from '../service-requests/hooks'
import { technicianApi } from './api'
import {
  technicianAvailabilityKey,
  technicianProfileKey,
  useSaveTechnicianProfile,
  useSendQuote,
  useTechnicianAvailability,
} from './hooks'
import type { TechnicianProfileForm } from './types'

jest.mock('./api', () => ({
  technicianApi: {
    saveProfile: jest.fn(),
    quote: jest.fn(),
    availability: jest.fn(),
    setAvailability: jest.fn(),
  },
}))

const form: TechnicianProfileForm = {
  documentNumber: '123',
  phone: '3001234567',
  categoryIds: ['category-1'],
  profilePhotoUrl: '',
  documentPhotoUrl: '/document',
  certificatePhotoUrl: '',
  workExperienceDescription: 'Cinco años de experiencia técnica.',
  latitude: '4.142',
  longitude: '-73.626',
  homeAddress: 'Calle 10',
  homeLatitude: '4.143',
  homeLongitude: '-73.627',
  homeCity: 'Villavicencio',
  homeNeighborhood: 'Centro',
  countryId: 'country-1',
  departmentId: 'department-1',
  cityId: 'city-1',
}

describe('technician hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('normaliza coordenadas y reutiliza experiencia como descripción', async () => {
    const profile = technicianProfileFixture()
    jest.mocked(technicianApi.saveProfile).mockResolvedValue(profile)
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const hook = renderHook(() => useSaveTechnicianProfile(true), { wrapper: QueryWrapper })

    await act(async () => { await hook.result.current.mutateAsync(form) })

    expect(technicianApi.saveProfile).toHaveBeenCalledWith(true, expect.objectContaining({
      description: form.workExperienceDescription,
      latitude: 4.142,
      longitude: -73.626,
      homeLatitude: 4.143,
      homeLongitude: -73.627,
    }))
    expect(queryClient.getQueryData(technicianProfileKey)).toEqual(profile)
  })

  it('envía cotización e invalida solicitudes disponibles', async () => {
    jest.mocked(technicianApi.quote).mockResolvedValue({} as never)
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const hook = renderHook(useSendQuote, { wrapper: QueryWrapper })

    await act(async () => {
      await hook.result.current.mutateAsync({
        id: 'request-1',
        price: 120000,
        description: 'Incluye materiales',
      })
    })

    expect(technicianApi.quote).toHaveBeenCalledWith(
      'request-1',
      120000,
      'Incluye materiales',
    )
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestKeys.availableRoot })
  })

  it('exige ubicación antes de activar disponibilidad y actualiza caché al aceptar', async () => {
    jest.mocked(technicianApi.availability).mockResolvedValue({ available: false })
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      granted: false,
      status: 'denied',
    } as never)
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const hook = renderHook(useTechnicianAvailability, { wrapper: QueryWrapper })
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true))

    await expect(hook.result.current.update.mutateAsync(true))
      .rejects.toThrow('Activa la ubicación')
    expect(technicianApi.setAvailability).not.toHaveBeenCalled()

    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      granted: true,
      status: 'granted',
    } as never)
    jest.mocked(technicianApi.setAvailability).mockResolvedValue({ available: true })
    await act(async () => { await hook.result.current.update.mutateAsync(true) })

    expect(queryClient.getQueryData(technicianAvailabilityKey)).toEqual({ available: true })
  })
})
