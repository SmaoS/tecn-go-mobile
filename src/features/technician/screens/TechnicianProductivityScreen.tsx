import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Card, colors, styles as uiStyles } from '../../../components/UI'
import { PrivateImage } from '../../../components/PrivateImage'
import { QueryState } from '../../../shared/QueryState'
import type { RootStackParamList } from '../../../types'
import { useTechnicianRatings } from '../../ratings/hooks'
import { useTechnicianProfile } from '../hooks'

const RATING_VISIBILITY_DELAY_DAYS = 2

export function TechnicianProductivityScreen({}: NativeStackScreenProps<RootStackParamList, 'TechnicianProductivity'>) {
  const profile = useTechnicianProfile()
  const ratings = useTechnicianRatings(profile.data?.userId)
  const visibleRatings = (ratings.data ?? []).filter((item) => isVisibleRating(item.createdAt))

  return <ScrollView style={local.screen} contentContainerStyle={local.content}>    
    <QueryState pending={profile.isPending} error={profile.error}>
      {profile.data && <Card>
        <View style={local.header}>
          {profile.data.profilePhotoUrl
            ? <PrivateImage url={profile.data.profilePhotoUrl} style={local.avatar} />
            : <View style={[local.avatar, local.fallback]}><Text style={local.initial}>{profile.data.fullName.charAt(0)}</Text></View>}
          <View style={local.headerText}>
            <Text style={uiStyles.cardTitle}>{profile.data.fullName}</Text>
            <Text style={local.rating}>★ {profile.data.averageRating.toFixed(1)}</Text>
            <Text style={uiStyles.muted}>{profile.data.completedServicesCount} servicios completados</Text>
          </View>
        </View>
      </Card>}
    </QueryState>

    <Text style={local.sectionTitle}>Opiniones y apreciaciones</Text>
    <Text style={uiStyles.muted}>Por privacidad operativa, las calificaciones se muestran con dos días de retraso.</Text>
    <QueryState pending={ratings.isPending} error={ratings.error} empty={visibleRatings.length === 0} emptyText="Aún no hay opiniones visibles.">
      {visibleRatings.map((item) => <Card key={item.id} style={local.reviewCard}>
        <View style={local.reviewHeader}>
          <Text style={local.date}>{new Date(item.createdAt).toLocaleDateString('es-CO')}</Text>
          <Text style={local.stars}>{'★'.repeat(item.score)}{'☆'.repeat(Math.max(0, 5 - item.score))}</Text>
        </View>
        <Text style={uiStyles.cardTitle}>Cliente</Text>
        {item.comment ? <Text style={uiStyles.muted}>{item.comment}</Text> : <Text style={uiStyles.muted}>Sin comentario.</Text>}
      </Card>)}
    </QueryState>
  </ScrollView>
}

function isVisibleRating(createdAt: string) {
  const value = Date.parse(createdAt)
  if (Number.isNaN(value)) return false
  return value <= Date.now() - RATING_VISIBILITY_DELAY_DAYS * 24 * 60 * 60 * 1000
}

const local = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.brand },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dark },
  initial: { color: colors.brand, fontSize: 28, fontWeight: '900' },
  headerText: { flex: 1, marginLeft: 14 },
  rating: { color: colors.brand, fontSize: 18, fontWeight: '900', marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 20, marginBottom: 6 },
  reviewCard: { padding: 14 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  stars: { color: colors.brand, fontSize: 16, fontWeight: '900' },
})
