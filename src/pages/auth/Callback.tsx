import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getUserProfile } from '@/lib/target-service'

export default function Callback() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id)
          if (!profile) {
            // New user - redirect to questionnaire
            navigate('/questionnaire', { replace: true })
          } else {
            // Existing user - redirect to home
            navigate('/home', { replace: true })
          }
        } catch (error) {
          console.error('Error checking user profile:', error)
          navigate('/home', { replace: true })
        }
      } else {
        // No user - back to welcome page
        navigate('/welcome', { replace: true })
      }
    }

    checkUserProfile()
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
}
