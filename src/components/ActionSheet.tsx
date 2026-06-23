import { Text } from 'react-native'
import { AppBottomSheet, SheetSecondaryButton, SheetTextButton } from './AppBottomSheet'
import { styles } from './UI'

export type ActionSheetOption = {
  label: string
  description?: string
  danger?: boolean
  onPress: () => void
}

export function ActionSheet({
  visible,
  title,
  message,
  options,
  onClose,
}: {
  visible: boolean
  title: string
  message?: string
  options: ActionSheetOption[]
  onClose: () => void
}) {
  return <AppBottomSheet visible={visible} title={title} message={message} onClose={onClose}>
    {options.map((option) => <SheetSecondaryButton
      key={option.label}
      title={option.description ? `${option.label}\n${option.description}` : option.label}
      danger={option.danger}
      onPress={() => {
        onClose()
        option.onPress()
      }}
    />)}
    <Text style={[styles.muted, { textAlign: 'center', marginTop: 12 }]}>Puedes cancelar y continuar editando.</Text>
    <SheetTextButton title="Cancelar" onPress={onClose} />
  </AppBottomSheet>
}
