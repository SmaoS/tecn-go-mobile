import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { categoryFixture } from '../../../test/fixtures'
import { useTechnicianCategories } from '../../technician/hooks'
import { onboardingApi } from '../api'
import { TechnicianProfessionalProfileOnboardingScreen } from './TechnicianProfessionalProfileOnboardingScreen'

jest.mock('../../technician/hooks', () => ({ useTechnicianCategories: jest.fn() }))
jest.mock('../api', () => ({ onboardingApi: { professionalProfile: jest.fn() } }))

describe('TechnicianProfessionalProfileOnboardingScreen', () => {
  it('exige categoría y experiencia mínima antes de continuar', async () => {
    jest.mocked(useTechnicianCategories).mockReturnValue({
      data: [categoryFixture()],
      isPending: false,
      error: null,
    } as never)
    jest.mocked(onboardingApi.professionalProfile).mockResolvedValue({} as never)
    const complete = jest.fn(async () => undefined)
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false, gcTime: Infinity } },
    })
    const view = render(
      <QueryClientProvider client={client}>
        <TechnicianProfessionalProfileOnboardingScreen onComplete={complete} />
      </QueryClientProvider>,
    )

    fireEvent.press(view.getByText('Continuar'))
    expect(onboardingApi.professionalProfile).not.toHaveBeenCalled()

    fireEvent.press(view.getByText('Electricista'))
    fireEvent.changeText(
      view.getByPlaceholderText('Describe tu experiencia'),
      'Cinco años de experiencia en instalaciones eléctricas residenciales.',
    )
    await act(async () => { fireEvent.press(view.getByText('Continuar')) })

    await waitFor(() => expect(onboardingApi.professionalProfile)
      .toHaveBeenCalledWith(expect.objectContaining({
        categoryIds: ['category-electrician'],
        workExperienceDescription:
          'Cinco años de experiencia en instalaciones eléctricas residenciales.',
      }), expect.anything()))
    expect(complete).toHaveBeenCalled()
  })
})
