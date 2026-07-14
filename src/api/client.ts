import axios from 'axios'
import { getStoredSession, removeStoredSession, SESSION_KEY } from '../services/sessionStorage'
import { captureClientError, Sentry } from '../services/observability'

export { SESSION_KEY }

const apiUrl = (process.env.EXPO_PUBLIC_API_URL
  ?? (process.env.EXPO_PUBLIC_APP_ENVIRONMENT === 'production' ? undefined : 'https://api.tecn-go.com/api'))
  ?.replace(/\/$/, '')
if (!apiUrl) throw new Error('EXPO_PUBLIC_API_URL is required')

let unauthorizedHandler: (() => void) | undefined
let operationBlockedHandler: ((code: string) => void) | undefined
export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler
}
export function setOperationBlockedHandler(handler: (code: string) => void) {
  operationBlockedHandler = handler
}

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const correlationId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  config.headers['X-Correlation-ID'] = correlationId
  config.headers['X-TecnGo-Correlation-ID'] = correlationId
  const raw = await getStoredSession()
  if (raw) config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
  return config
})

api.interceptors.response.use(
  (response) => {
    const correlationId = response.headers['x-correlation-id']
    if (correlationId) {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `${response.config.method?.toUpperCase()} ${response.config.url}`,
        data: { correlationId, status: response.status },
        level: 'info',
      })
    }
    return response
  },
  async (error) => {
    const correlationId = error.response?.headers?.['x-correlation-id']
      || error.config?.headers?.['X-TecnGo-Correlation-ID']
    if (!error.response || error.response.status >= 500) {
      captureClientError(error, correlationId)
    }
    if (error.response?.status === 401) {
      await removeStoredSession()
      unauthorizedHandler?.()
    }
    if ((error.response?.status === 403 || error.response?.status === 409)
        && typeof error.response.data?.code === 'string') {
      operationBlockedHandler?.(error.response.data.code)
    }
    return Promise.reject(error)
  },
)
