import { renderWithProviders } from '../../../test/render'
import { PqrScreen } from './PqrScreen'

jest.mock('../api', () => ({
  complianceApi: {
    requestExport: jest.fn(),
    exportRequests: jest.fn().mockResolvedValue([]),
    requestAnonymization: jest.fn(),
    profileSelfieChangeRequests: jest.fn().mockResolvedValue([]),
  },
}))

describe('PqrScreen', () => {
  it('centraliza opciones de datos personales', () => {
    const navigation = { navigate: jest.fn() }
    const view = renderWithProviders(<PqrScreen navigation={navigation as never} route={{ name: 'Pqr', key: 'Pqr' } as never} />)
    
    expect(view.getByText('Solicitar exportación de mis datos')).toBeTruthy()
    expect(view.getByText('Solicitar anonimización')).toBeTruthy()
    expect(view.getByText('Solicitar cambio de selfie')).toBeTruthy()
  })
})
