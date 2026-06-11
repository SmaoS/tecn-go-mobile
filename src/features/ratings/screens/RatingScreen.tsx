import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Field, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList } from '../../../types'
import { useSubmitRating } from '../hooks'

export function RatingScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Rating'>) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const submit = useSubmitRating(() => navigation.popToTop())
  return <KeyboardAwareScreen><Text style={styles.title}>Califica el servicio</Text><Text style={styles.subtitle}>Tu opinión ayuda a construir confianza.</Text><View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={{ color: value <= rating ? colors.brand : colors.muted, fontSize: 34 }}>★</Text></Pressable>)}</View><Field multiline placeholder="Cuéntanos cómo fue la experiencia" value={comment} onChangeText={setComment} />{submit.error && <Text style={styles.error}>{apiMessage(submit.error)}</Text>}<Button title="Enviar calificación" onPress={() => submit.mutate({ requestId: route.params.requestId, score: rating, comment })} loading={submit.isPending} /></KeyboardAwareScreen>
}
