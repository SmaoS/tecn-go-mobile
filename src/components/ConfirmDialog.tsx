import { AppBottomSheet, SheetPrimaryButton, SheetSecondaryButton, SheetTextButton } from './AppBottomSheet'

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return <AppBottomSheet visible={visible} title={title} message={message} onClose={onClose}>
    {danger
      ? <SheetSecondaryButton title={confirmLabel} danger disabled={loading} onPress={onConfirm} />
      : <SheetPrimaryButton title={confirmLabel} loading={loading} onPress={onConfirm} />}
    <SheetTextButton title={cancelLabel} onPress={onClose} />
  </AppBottomSheet>
}
