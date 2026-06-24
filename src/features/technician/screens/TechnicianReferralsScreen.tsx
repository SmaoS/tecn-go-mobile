import { Share, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { Button, Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { QueryState } from '../../../shared/QueryState'
import { useTechnicianReferrals } from '../hooks'
import { useSession } from '../../../context/useSession'

const playStoreUrl = process.env.EXPO_PUBLIC_PLAY_STORE_URL
  ?? 'https://play.google.com/store/apps/details?id=com.tecngo'

export function TechnicianReferralsScreen() {
  const { code, referrals, rewards } = useTechnicianReferrals()
  const { session } = useSession()
  const technicianMode = (session?.activeMode ?? session?.role) === 'TECHNICIAN'
  return <KeyboardAwareScreen>
    <Text style={styles.subtitle}>{technicianMode
      ? 'Invita clientes o técnicos. Cuando completen un servicio con 5 estrellas, ganas un servicio sin comisión.'
      : 'Invita amigos a descargar TecnGo y registrarse con tu código personal.'}</Text>
    <QueryState pending={code.isPending || referrals.isPending || rewards.isPending} error={code.error ?? referrals.error ?? rewards.error}>
      {code.data && <><Card><Text style={styles.muted}>Tu código</Text><Text style={[styles.title, { color: colors.brand }]}>{code.data.code}</Text>
        <Button title="Copiar código" onPress={() => void Clipboard.setStringAsync(code.data!.code)} />
        <Button title="Compartir invitación" onPress={() => void Share.share({
          message: `Descarga TecnGo desde Google Play y regístrate con mi código ${code.data!.code}:\n${playStoreUrl}`,
        })} />
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.registered}</Text><Text style={styles.muted}>Registrados</Text></Card>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.qualified}</Text><Text style={styles.muted}>Calificados</Text></Card>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.availableRewards}</Text><Text style={styles.muted}>Beneficios</Text></Card>
      </View>
      <Card><Text style={styles.cardTitle}>Historial</Text>{referrals.data?.length === 0 && <Text style={styles.muted}>Aún no tienes referidos.</Text>}{referrals.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.referredUserName} · {item.status}</Text>)}</Card>
      {technicianMode && <Card><Text style={styles.cardTitle}>Servicios sin comisión</Text>{rewards.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.status}</Text>)}</Card>}</>}
    </QueryState>
  </KeyboardAwareScreen>
}
