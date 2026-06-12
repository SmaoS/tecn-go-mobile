import type { RequestStatus } from '../../types'

export const requestStatusLabels: Record<RequestStatus, string> = {
  QUOTE_PENDING: 'Pendiente de cotizaciones',
  QUOTED: 'Cotizado',
  QUOTE_ACCEPTED: 'Cotización aceptada',
  ON_THE_WAY: 'Técnico en camino',
  ARRIVED: 'Técnico en el lugar',
  IN_PROGRESS: 'Servicio en curso',
  COMPLETED: 'Servicio completado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
}
