import axios from 'axios'
import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { QueryState } from './QueryState'
import { apiMessage, hasApiStatus } from './apiMessage'

describe('QueryState', () => {
  it('muestra estados de carga, vacío y contenido', () => {
    const loading = render(
      <QueryState pending error={null}><Text>Contenido</Text></QueryState>,
    )
    expect(loading.getByText('Cargando...')).toBeTruthy()

    loading.rerender(
      <QueryState pending={false} error={null} empty emptyText="Sin solicitudes">
        <Text>Contenido</Text>
      </QueryState>,
    )
    expect(loading.getByText('Sin solicitudes')).toBeTruthy()

    loading.rerender(
      <QueryState pending={false} error={null}><Text>Contenido</Text></QueryState>,
    )
    expect(loading.getByText('Contenido')).toBeTruthy()
  })

  it('convierte errores de API en mensajes visibles', () => {
    const error = new axios.AxiosError('Forbidden')
    error.response = {
      data: { message: 'Debes completar tu inscripción' },
      status: 403,
      statusText: 'Forbidden',
      headers: {},
      config: { headers: {} } as never,
    }

    const view = render(
      <QueryState pending={false} error={error}><Text>Contenido</Text></QueryState>,
    )

    expect(view.getByText('Debes completar tu inscripción')).toBeTruthy()
    expect(apiMessage(error)).toBe('Debes completar tu inscripción')
    expect(hasApiStatus(error, 403)).toBe(true)
    expect(apiMessage(new Error('failure'))).toBe('Error inesperado')
  })
})
