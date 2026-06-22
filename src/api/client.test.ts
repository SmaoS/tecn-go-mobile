import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import * as Sentry from '@sentry/react-native'
import { api, setOperationBlockedHandler, setUnauthorizedHandler } from './client'
import * as sessionStorage from '../services/sessionStorage'

function response(
  config: InternalAxiosRequestConfig,
  status = 200,
  data: unknown = {},
  headers: Record<string, string> = {},
): AxiosResponse {
  return { config, status, statusText: String(status), data, headers }
}

function rejected(
  config: InternalAxiosRequestConfig,
  status?: number,
  data: unknown = {},
  headers: Record<string, string> = {},
) {
  const error = new Error('Request failed') as AxiosError
  error.config = config
  if (status) error.response = response(config, status, data, headers)
  return Promise.reject(error)
}

describe('api client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1_750_000_000_000)
    jest.spyOn(Math, 'random').mockReturnValue(0.123456)
  })

  it('agrega JWT y correlation ID a cada petición', async () => {
    jest.spyOn(sessionStorage, 'getStoredSession').mockResolvedValue(JSON.stringify({
      token: 'jwt-test',
    }))
    let captured: InternalAxiosRequestConfig | undefined

    await api.get('/secure', {
      adapter: async (config) => {
        captured = config
        return response(config)
      },
    })

    expect(captured?.headers.Authorization).toBe('Bearer jwt-test')
    expect(captured?.headers['X-Correlation-ID']).toBeTruthy()
    expect(captured?.headers['X-TecnGo-Correlation-ID'])
      .toBe(captured?.headers['X-Correlation-ID'])
  })

  it('registra el correlation ID retornado por el backend', async () => {
    jest.spyOn(sessionStorage, 'getStoredSession').mockResolvedValue(null)

    await api.get('/health', {
      adapter: async (config) => response(
        config,
        200,
        {},
        { 'x-correlation-id': 'server-correlation-id' },
      ),
    })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({
      category: 'api',
      data: { correlationId: 'server-correlation-id', status: 200 },
    }))
  })

  it('elimina la sesión y ejecuta logout automático ante 401', async () => {
    const unauthorized = jest.fn()
    const remove = jest.spyOn(sessionStorage, 'removeStoredSession').mockResolvedValue()
    jest.spyOn(sessionStorage, 'getStoredSession').mockResolvedValue(null)
    setUnauthorizedHandler(unauthorized)

    await expect(api.get('/private', {
      adapter: async (config) => rejected(config, 401),
    })).rejects.toThrow('Request failed')

    expect(remove).toHaveBeenCalled()
    expect(unauthorized).toHaveBeenCalled()
  })

  it('redirige bloqueos funcionales identificados por código 403', async () => {
    const blocked = jest.fn()
    jest.spyOn(sessionStorage, 'getStoredSession').mockResolvedValue(null)
    setOperationBlockedHandler(blocked)

    await expect(api.get('/blocked', {
      adapter: async (config) => rejected(config, 403, {
        code: 'ONBOARDING_REQUIRED',
      }),
    })).rejects.toThrow('Request failed')

    expect(blocked).toHaveBeenCalledWith('ONBOARDING_REQUIRED')
  })
})
