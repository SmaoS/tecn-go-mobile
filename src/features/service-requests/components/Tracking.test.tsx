import { render } from '@testing-library/react-native'
import { View } from 'react-native'
import { Tracking } from './Tracking'

describe('Tracking', () => {
  it('renders all progress steps for active services', () => {
    const view = render(<Tracking status="IN_PROGRESS" />)
    expect(view.UNSAFE_getAllByType(View)).toHaveLength(9)
  })

  it('does not render progress for cancelled services', () => {
    const view = render(<Tracking status="CANCELLED" />)
    expect(view.toJSON()).toBeNull()
  })
})
