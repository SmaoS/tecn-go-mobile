export const paymentMethodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  BREB: 'Bre-B',
  NEQUI: 'Nequi',
  DAVIPLATA: 'Daviplata',
  BANCOLOMBIA: 'Bancolombia',
  DAVIVIENDA: 'Davivienda',
  WOMPI: 'Wompi',
  MERCADO_PAGO: 'Mercado Pago',
  PAYU: 'PayU',
}

export const requestPaymentMethods = ['CASH', 'BREB', 'NEQUI', 'DAVIPLATA', 'BANCOLOMBIA', 'DAVIVIENDA'] as const
export type RequestPaymentMethod = typeof requestPaymentMethods[number]
