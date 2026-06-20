export function formatCopCurrency(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return 'Sin estimado'
  return `$${Math.round(value).toLocaleString('es-CO')} COP`
}

export function formatElapsedTime(createdAt: string, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 1_000))
  if (seconds < 60) return `${seconds} seg.`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min.`
  return `${Math.floor(minutes / 60)} h.`
}
