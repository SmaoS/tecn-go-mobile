import axios from 'axios'
import { api } from '../api/client'

export function apiMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Error inesperado'
  if (error.response) return error.response.data?.message ?? `La API respondió con estado ${error.response.status}`
  return `No fue posible conectar con TecnGo en ${api.defaults.baseURL}`
}

export function hasApiStatus(error: unknown, status: number) {
  return axios.isAxiosError(error) && error.response?.status === status
}
