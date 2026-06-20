import type { UserNotification } from '../../types'

const titles: Partial<Record<UserNotification['type'], string>> = {
  NEW_REQUEST: 'Nueva solicitud cercana disponible',
  NEW_QUOTE: 'Nueva cotización recibida',
  QUOTE_ACCEPTED: 'Cotización aceptada por el cliente',
  QUOTE_REJECTED: 'Cotización no seleccionada',
  REQUEST_ACCEPTED: 'Solicitud aceptada',
  TECHNICIAN_ON_THE_WAY: 'Técnico en camino',
  TECHNICIAN_ARRIVED: 'Técnico llegó al servicio',
  SERVICE_STARTED: 'Servicio iniciado',
  SERVICE_COMPLETED: 'Servicio finalizado',
  NEW_CHAT_MESSAGE: 'Nuevo mensaje recibido',
  NEW_RATING: 'Nueva calificación recibida',
  PAYMENT_PROOF_UPLOADED: 'Nuevo comprobante de pago recibido',
  PAYMENT_PROOF_VERIFIED: 'Comprobante de pago verificado',
  SERVICE_EVIDENCE_UPLOADED: 'Nueva evidencia recibida',
  SERVICE_STATUS_CHANGED: 'Estado del servicio actualizado',
  LEGAL_ACCEPTANCE_REQUIRED: 'Documentos legales pendientes',
}

export function notificationTitle(item: UserNotification) {
  return titles[item.type] ?? item.title
}
