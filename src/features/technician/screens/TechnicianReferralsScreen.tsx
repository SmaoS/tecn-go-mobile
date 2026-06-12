import { Share, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { Button, Card, colors, styles } from '../../../components/UI'
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen'
import { QueryState } from '../../../shared/QueryState'
import { useTechnicianReferrals } from '../hooks'

export function TechnicianReferralsScreen() {
  const { code, referrals, rewards } = useTechnicianReferrals()
  const shareUrl = code.data ? `https://tecn-go.com/register?ref=${code.data.code}` : ''
  return <KeyboardAwareScreen><Text style={styles.title}>Invita y gana</Text>
    <Text style={styles.subtitle}>Invita clientes o técnicos. Cuando completen un servicio con 5 estrellas, ganas un servicio sin comisión.</Text>
    <QueryState pending={code.isPending || referrals.isPending || rewards.isPending} error={code.error ?? referrals.error ?? rewards.error}>
      {code.data && <><Card><Text style={styles.muted}>Tu código</Text><Text style={[styles.title, { color: colors.brand }]}>{code.data.code}</Text>
        <Button title="Copiar código" onPress={() => void Clipboard.setStringAsync(code.data!.code)} />
        <Button title="Compartir invitación" onPress={() => void Share.share({ message: `Únete a TecnGo con mi código ${code.data!.code}: ${shareUrl}` })} />
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.registered}</Text><Text style={styles.muted}>Registrados</Text></Card>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.qualified}</Text><Text style={styles.muted}>Calificados</Text></Card>
        <Card style={{ flexGrow: 1 }}><Text style={styles.cardTitle}>{code.data.availableRewards}</Text><Text style={styles.muted}>Beneficios</Text></Card>
      </View>
      <Card><Text style={styles.cardTitle}>Historial</Text>{referrals.data?.length === 0 && <Text style={styles.muted}>Aún no tienes referidos.</Text>}{referrals.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.referredUserName} · {item.status}</Text>)}</Card>
      <Card><Text style={styles.cardTitle}>Servicios sin comisión</Text>{rewards.data?.map((item) => <Text key={item.id} style={styles.muted}>{item.status}</Text>)}</Card></>}
    </QueryState>
  </KeyboardAwareScreen>
}
