import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AppBottomSheet, SheetPrimaryButton, SheetTextButton } from '../../../components/AppBottomSheet'
import { Field, colors, styles } from '../../../components/UI'
import { apiMessage } from '../../../shared/apiMessage'
import { useSubmitRating } from '../hooks'

export function RatingBottomSheet({
  visible,
  requestId,
  title = 'Califica al cliente',
  message = 'Tu calificación ayuda a mantener una comunidad segura.',
  onClose,
  onSubmitted,
}: {
  visible: boolean
  requestId?: string
  title?: string
  message?: string
  onClose: () => void
  onSubmitted?: () => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const submit = useSubmitRating(() => {
    setComment('')
    setRating(5)
    onSubmitted?.()
    onClose()
  })
  return <AppBottomSheet visible={visible} title={title} message={message} onClose={onClose}>
    <View style={local.stars}>
      {[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}>
        <Text style={[local.star, { color: value <= rating ? colors.brand : colors.muted }]}>★</Text>
      </Pressable>)}
    </View>
    <Field multiline placeholder="Comentario opcional" value={comment} onChangeText={setComment} />
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
