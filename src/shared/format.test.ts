import { formatCopCurrency, formatElapsedTime, formatThousandsInput, onlyDigits } from './format'

describe('formatos compartidos', () => {
  it('formatea valores en pesos colombianos', () => {
    expect(formatCopCurrency(100000)).toBe('$100.000 COP')
    expect(formatCopCurrency(undefined)).toBe('Sin estimado')
  })

  it('formatea entradas monetarias solo con separador de miles', () => {
    expect(formatThousandsInput('100000')).toBe('100.000')
    expect(formatThousandsInput('$100.000 COP')).toBe('100.000')
    expect(formatThousandsInput('')).toBe('')
    expect(onlyDigits('120.000 COP')).toBe('120000')
  })

  it('resume el tiempo transcurrido', () => {
    const now = Date.parse('2026-06-21T12:00:00Z')
    expect(formatElapsedTime('2026-06-21T11:59:30Z', now)).toBe('30 seg.')
    expect(formatElapsedTime('2026-06-21T11:30:00Z', now)).toBe('30 min.')
    expect(formatElapsedTime('2026-06-21T09:00:00Z', now)).toBe('3 h.')
  })
})
