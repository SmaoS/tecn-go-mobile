import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AppBottomSheet, SheetPrimaryButton, SheetTextButton } from '../../../components/AppBottomSheet'
import { Field, colors, styles } from '../../../components/UI'
import { apiMessage } from '../../../shared/apiMessage'
import { useSubmitRating } from '../hooks'
import { buildRatingComment, type RatingAudience } from '../ratingPhrases'
import { RatingPhraseChips } from './RatingPhraseChips'

export function RatingBottomSheet({
  visible,
  requestId,
  audience = 'TECHNICIAN',
  title = 'Califica al cliente',
  message = 'Tu calificación ayuda a mantener una comunidad segura.',
  onClose,
  onSubmitted,
}: {
  visible: boolean
  requestId?: string
  audience?: RatingAudience
  title?: string
  message?: string
  onClose: () => void
  onSubmitted?: () => void
}) {
  const [rating, setRating] = useState(5)
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([])
  const [personalComment, setPersonalComment] = useState('')
  const submit = useSubmitRating(() => {
    setSelectedPhrases([])
    setPersonalComment('')
    setRating(5)
    onSubmitted?.()
    onClose()
  })
  const comment = buildRatingComment(selectedPhrases, personalComment)
  return <AppBottomSheet visible={visible} title={title} message={message} onClose={onClose}>
    <View style={local.stars}>
      {[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}>
        <Text style={[local.star, { color: value <= rating ? colors.brand : colors.muted }]}>★</Text>
      </Pressable>)}
    </View>
    <RatingPhraseChips audience={audience} selected={selectedPhrases} onChange={setSelectedPhrases} />
    <Field multiline placeholder="Comentario personal opcional" value={personalComment} onChangeText={setPersonalComment} />
    {submit.error && <Text style={styles.error}>{apiMessage(submit.error)}</Text>}
    <SheetPrimaryButton
      title="Enviar calificación"
      loading={submit.isPending}
      disabled={!requestId}
      onPress={() => requestId && submit.mutate({ requestId, score: rating, comment })}
    />
    <SheetTextButton title="Calificar después" onPress={onClose} />
  </AppBottomSheet>
}

const local = StyleSheet.create({
  stars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18,
  },
  star: {
    fontSize: 34,
  },
})
