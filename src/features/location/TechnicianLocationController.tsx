import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { locationTrackingService } from '../../services/LocationTrackingService'
import { requestKeys } from '../service-requests/hooks'
import { serviceRequestApi } from '../service-requests/api'
import { useTechnicianAvailability } from '../technician/hooks'

const trackingStatuses = new Set(['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'])

export function TechnicianLocationController() {
  const [appActive, setAppActive] = useState(AppState.currentState === 'active')
  const availability = useTechnicianAvailability()
  const assigned = useQuery({
    queryKey: requestKeys.assigned,
    queryFn: serviceRequestApi.assigned,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  })
  const hasActiveService = (assigned.data ?? []).some((request) => trackingStatuses.has(request.status))
  const shouldTrack = (availability.data?.available ?? false) || hasActiveService

  useEffect(() => {
    if (shouldTrack && appActive) {
      void locationTrackingService.startTracking().catch(() => {
        // The profile and request screens expose the permission retry action.
      })
    } else if (!appActive) {
      locationTrackingService.pauseTracking()
    } else {
      void locationTrackingService.stopTracking().catch(() => {
        // Going offline is retried on the next availability or session change.
      })
    }
  }, [appActive, shouldTrack])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active')
    })
    return () => subscription.remove()
  }, [])

  useEffect(() => () => {
    void locationTrackingService.stopTracking().catch(() => {
      // Cleanup must not interrupt navigation.
    })
  }, [])

  return null
}
