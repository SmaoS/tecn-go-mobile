import { Button } from './UI'

export function FloatingFormFooter({
  title,
  onPress,
  loading,
  disabled,
  testID,
}: {
  title: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  testID?: string
}) {
  return <Button testID={testID} title={title} onPress={onPress} loading={loading} disabled={disabled} />
}
