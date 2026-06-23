import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, colors } from './UI'

export function AppBottomSheet({
  visible,
  title,
  message,
  children,
  onClose,
}: {
  visible: boolean
  title: string
  message?: string
  children: ReactNode
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={sheetStyles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[sheetStyles.sheet, { paddingBottom: Math.max(insets.bottom, 22) }]}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>{title}</Text>
        {message ? <Text style={sheetStyles.message}>{message}</Text> : null}
        {children}
      </View>
    </View>
  </Modal>
}

export function SheetSecondaryButton({
  title,
  onPress,
  danger,
  disabled,
}: {
  title: string
  onPress: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={[sheetStyles.secondaryButton, danger && sheetStyles.dangerButton, disabled && sheetStyles.disabled]}
  >
    <Text style={[sheetStyles.secondaryText, danger && sheetStyles.dangerText]}>{title}</Text>
  </Pressable>
}

export function SheetTextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={sheetStyles.textButton}>
    <Text style={sheetStyles.textButtonLabel}>{title}</Text>
  </Pressable>
}

export function SheetPrimaryButton({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}) {
  return <Button title={title} onPress={onPress} loading={loading} disabled={disabled} />
}

export const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 8, 23, 0.74)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#334155',
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  dangerButton: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  disabled: {
    opacity: 0.45,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  dangerText: {
    color: '#FCA5A5',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  textButtonLabel: {
    color: colors.muted,
    fontWeight: '800',
  },
})
