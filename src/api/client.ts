import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

export const SESSION_KEY = 'tecngo.session'

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '')
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
  const raw = await AsyncStorage.getItem(SESSION_KEY)
  if (raw) config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(SESSION_KEY)
      unauthorizedHandler?.()
    }
    if (error.response?.status === 403 && typeof error.response.data?.code === 'string') {
      operationBlockedHandler?.(error.response.data.code)
    }
    return Promise.reject(error)
  },
)
