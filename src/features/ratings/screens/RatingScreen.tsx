import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Field, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { apiMessage } from '../../../shared/apiMessage'
import type { RootStackParamList } from '../../../types'
import { useSession } from '../../../context/useSession'
import { RatingPhraseChips } from '../components/RatingPhraseChips'
import { useSubmitRating } from '../hooks'
import { buildRatingComment, type RatingAudience } from '../ratingPhrases'

export function RatingScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Rating'>) {
  const [rating, setRating] = useState(5)
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([])
  const [personalComment, setPersonalComment] = useState('')
  const { session } = useSession()
  const audience: RatingAudience = session?.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CLIENT'
  const submit = useSubmitRating(() => navigation.popToTop())
  const comment = buildRatingComment(selectedPhrases, personalComment)
  return <KeyboardAwareScreen><Text style={styles.title}>Califica el servicio</Text><Text style={styles.subtitle}>Tu opinión ayuda a construir confianza.</Text><View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={{ color: value <= rating ? colors.brand : colors.muted, fontSize: 34 }}>★</Text></Pressable>)}</View><RatingPhraseChips audience={audience} selected={selectedPhrases} onChange={setSelectedPhrases} /><Field multiline placeholder="Escribe algo personal (opcional)" value={personalComment} onChangeText={setPersonalComment} />{submit.error && <Text style={styles.error}>{apiMessage(submit.error)}</Text>}<Button title="Enviar calificación" onPress={() => submit.mutate({ requestId: route.params.requestId, score: rating, comment })} loading={submit.isPending} /></KeyboardAwareScreen>
}
