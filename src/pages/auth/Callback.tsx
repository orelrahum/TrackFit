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
            // משתמש חדש - הפניה לשאלון
            navigate('/questionnaire', { replace: true })
          } else {
            // משתמש קיים - הפניה לדף הבית
            navigate('/', { replace: true })
          }
        } catch (error) {
          console.error('Error checking user profile:', error)
          navigate('/', { replace: true })
        }
      }
    }

    checkUserProfile()
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
}
