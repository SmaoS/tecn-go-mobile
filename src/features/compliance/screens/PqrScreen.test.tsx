import { renderWithProviders } from '../../../test/render'
import { PqrScreen } from './PqrScreen'

jest.mock('../api', () => ({
  complianceApi: {
    exportMine: jest.fn(),
    requestAnonymization: jest.fn(),
  },
}))

describe('PqrScreen', () => {
  it('centraliza opciones de datos personales', () => {
    const view = renderWithProviders(<PqrScreen />)
    
    expect(view.getByText('Exportar mis datos')).toBeTruthy()
    expect(view.getByText('Solicitar anonimización')).toBeTruthy()
  })
})
