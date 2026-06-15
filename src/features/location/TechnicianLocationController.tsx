import { useEffect } from 'react'
import { locationTrackingService } from '../../services/LocationTrackingService'
import { useAssignedRequests } from '../service-requests/hooks'
import { useTechnicianAvailability } from '../technician/hooks'

const trackingStatuses = new Set(['QUOTE_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'])

export function TechnicianLocationController() {
  const availability = useTechnicianAvailability()
  const assigned = useAssignedRequests()
  const hasActiveService = (assigned.data ?? []).some((request) => trackingStatuses.has(request.status))
  const shouldTrack = (availability.data?.available ?? false) || hasActiveService

  useEffect(() => {
    if (shouldTrack) {
      void locationTrackingService.startTracking().catch(() => {
        // The profile and request screens expose the permission retry action.
      })
    } else {
      void locationTrackingService.stopTracking().catch(() => {
        // Going offline is retried on the next availability or session change.
      })
    }
  }, [shouldTrack])

  useEffect(() => () => {
    void locationTrackingService.stopTracking().catch(() => {
      // Cleanup must not interrupt navigation.
    })
  }, [])

  return null
}
