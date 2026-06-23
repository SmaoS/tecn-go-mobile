export const LOCAL_PHONE_LENGTH = 10

export function normalizeLocalPhone(value?: string) {
  return (value ?? '').replace(/\D/g, '').slice(0, LOCAL_PHONE_LENGTH)
}

export function isValidLocalPhone(value?: string) {
  return normalizeLocalPhone(value).length === LOCAL_PHONE_LENGTH
}

export const localPhoneHint = 'El celular debe tener exactamente 10 dígitos.'
