import { Text } from 'react-native'
import { useSession } from '../context/useSession'
import { renderWithProviders } from './render'
import { sessionFixture } from './fixtures'

function SessionProbe() {
  const { session } = useSession()
  return <Text>{session?.fullName ?? 'Sin sesión'}</Text>
}

describe('infraestructura de pruebas', () => {
  it('inyecta sesión y QueryClient reutilizables', () => {
    const session = sessionFixture({ fullName: 'Usuario de prueba' })
    const view = renderWithProviders(<SessionProbe />, { session })

    expect(view.getByText('Usuario de prueba')).toBeTruthy()
    expect(view.queryClient.getDefaultOptions().queries?.retry).toBe(false)
  })

  it('permite renderizar dentro de NavigationContainer', () => {
    const view = renderWithProviders(<Text>Pantalla navegable</Text>, {
      withNavigation: true,
    })

    expect(view.getByText('Pantalla navegable')).toBeTruthy()
  })
})
