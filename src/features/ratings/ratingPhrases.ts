export type RatingAudience = 'CLIENT' | 'TECHNICIAN'

export type RatingPhrase = {
  text: string
  audiences: RatingAudience[]
}

export const ratingPhrases: RatingPhrase[] = [
  { text: 'Excelente servicio', audiences: ['CLIENT'] },
  { text: 'Muy rápido', audiences: ['CLIENT'] },
  { text: 'Muy limpio', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Puntual y responsable', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Amable y respetuoso', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Trabajo de calidad', audiences: ['CLIENT'] },
  { text: 'Buena comunicación', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Cumplió con lo acordado', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Recomendado', audiences: ['CLIENT', 'TECHNICIAN'] },
  { text: 'Gran experiencia', audiences: ['CLIENT', 'TECHNICIAN'] },
]

export function phrasesForAudience(audience: RatingAudience) {
  return ratingPhrases.filter((phrase) => phrase.audiences.includes(audience))
}

export function buildRatingComment(selectedPhrases: string[], personalComment: string) {
  return [...selectedPhrases, personalComment.trim()]
    .filter(Boolean)
    .join('. ')
}
