import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, type MapPressEvent } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, colors } from '../../components/UI'
import type { Coordinates } from './hooks'

const DEFAULT_COORDINATES: Coordinates = { latitude: 4.142, longitude: -73.6266 }

interface Props {
  visible: boolean
  value?: Coordinates | null
  onSelect: (coordinates: Coordinates) => void
  onClose: () => void
}

export function LocationPickerModal({ visible, value, onSelect, onClose }: Props) {
  const current = value ?? DEFAULT_COORDINATES
  function choose(event: MapPressEvent) {
    onSelect({
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    })
  }

  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={pickerStyles.safe}>
      <View style={pickerStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={pickerStyles.title}>Ubicación del servicio</Text>
          <Text style={pickerStyles.subtitle}>Toca el mapa o mueve el pin al lugar donde necesitas el técnico.</Text>
        </View>
        <Pressable onPress={onClose} style={pickerStyles.close}><Text style={pickerStyles.closeText}>×</Text></Pressable>
      </View>
      <MapView
        style={pickerStyles.map}
        initialRegion={{
          latitude: current.latitude,
          longitude: current.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={choose}
      >
        <Marker
          draggable
          coordinate={current}
          onDragEnd={(event) => onSelect({
            latitude: event.nativeEvent.coordinate.latitude,
            longitude: event.nativeEvent.coordinate.longitude,
          })}
        />
      </MapView>
      <View style={pickerStyles.footer}>
        <Text style={pickerStyles.coords}>Ubicación seleccionada internamente.</Text>
        <Button title="Usar esta ubicación" onPress={onClose} />
      </View>
    </SafeAreaView>
  </Modal>
}

const pickerStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', padding: 18 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  close: { alignItems: 'center', borderColor: colors.border, borderRadius: 999, borderWidth: 1, height: 34, justifyContent: 'center', width: 34 },
  closeText: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 24 },
  map: { flex: 1 },
  footer: { borderTopColor: colors.border, borderTopWidth: 1, padding: 18 },
  coords: { color: colors.muted, marginBottom: 10 },
})
