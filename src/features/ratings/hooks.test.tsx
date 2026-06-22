import { act, renderHook, waitFor } from '@testing-library/react-native'
import { createQueryWrapper } from '../../test/render'
import { ratingsApi } from './api'
import {
  ratingStatusKey,
  useRatingStatus,
  useRatingStatuses,
  useSubmitRating,
} from './hooks'

jest.mock('./api', () => ({
  ratingsApi: {
    status: jest.fn(),
    create: jest.fn(),
  },
}))

describe('rating hooks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('consulta estado individual y múltiple', async () => {
    jest.mocked(ratingsApi.status).mockImplementation(async (id) => ({ rated: id === 'one' }))
    const { QueryWrapper } = createQueryWrapper()
    const single = renderHook(() => useRatingStatus('one'), { wrapper: QueryWrapper })
    const multiple = renderHook(() => useRatingStatuses(['one', 'two']), {
      wrapper: QueryWrapper,
    })

    await waitFor(() => expect(single.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(multiple.result.current.isSuccess).toBe(true))
    expect(single.result.current.data).toEqual({ rated: true })
    expect(multiple.result.current.data).toEqual({ one: true, two: false })
  })

  it('envía calificación e invalida estado para ocultar la opción repetida', async () => {
    jest.mocked(ratingsApi.create).mockResolvedValue({} as never)
    const complete = jest.fn()
    const { queryClient, QueryWrapper } = createQueryWrapper()
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()
    const hook = renderHook(() => useSubmitRating(complete), { wrapper: QueryWrapper })

    await act(async () => {
      await hook.result.current.mutateAsync({
        requestId: 'request-1',
        score: 5,
        comment: 'Excelente',
      })
    })

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['ratings'] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ratingStatusKey('request-1') })
    expect(complete).toHaveBeenCalled()
  })
})
