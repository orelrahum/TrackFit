import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getUserTargets } from '@/lib/target-service'
import type { UserTargets } from '@/types'

export function useUserTargets() {
  const { user } = useAuth()
  const [targets, setTargets] = useState<UserTargets | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadTargets = async () => {
      if (!user) {
        console.log('No user found, skipping target load')
        setIsLoading(false)
        return
      }

      try {
        console.log('Fetching targets for user:', user.id)
        const data = await getUserTargets(user.id)
        console.log('Received targets:', data)
        
        if (!isMounted) return

        if (!data || typeof data.calories !== 'number') {
          console.error('Invalid target data received:', data)
          throw new Error('Invalid target data')
        }

        setTargets(data)
        setError(null)
      } catch (err) {
        console.error('Error loading user targets:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load targets'))
          setTargets(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    setIsLoading(true)
    
    // Try to load immediately
    loadTargets()

    // Try again after a short delay (for new registrations)
    const retryTimer = setTimeout(() => {
      if (isMounted) {
        loadTargets()
      }
    }, 1000)

    return () => {
      isMounted = false
      clearTimeout(retryTimer)
      setTargets(null)
      setError(null)
      setIsLoading(false)
    }
  }, [user])

  return { targets, isLoading, error }
}
