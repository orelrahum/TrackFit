import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { getAuthErrorMessage } from '@/lib/auth-messages'

export default function Login() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        toast({
          title: 'התנתקת בהצלחה',
          duration: 3000,
        })
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          toast({
            title: 'ברוך הבא!',
            description: 'התחברת בהצלחה',
            duration: 3000,
          })
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: 'בקשת שחזור סיסמה',
          description: 'נשלח אליך מייל עם הוראות לאיפוס הסיסמה',
          duration: 5000,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 auth-container" dir="rtl">
      <Card className="w-full max-w-md auth-form">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ברוכים הבאים ל-TrackFit</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#333333',
                  },
                },
              },
              className: {
                container: 'auth-form',
                label: 'auth-label',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'כתובת אימייל',
                  password_label: 'סיסמה',
                  email_input_placeholder: 'כתובת האימייל שלך',
                  password_input_placeholder: 'הסיסמה שלך',
                  button_label: 'כניסה',
                  loading_button_label: 'מתחבר...',
                  link_text: 'יש לך כבר חשבון? היכנס',
                },
                sign_up: {
                  email_label: 'כתובת אימייל',
                  password_label: 'סיסמה',
                  email_input_placeholder: 'כתובת האימייל שלך',
                  password_input_placeholder: 'הסיסמה שלך',
                  button_label: 'הרשמה',
                  loading_button_label: 'נרשם...',
                  link_text: 'אין לך חשבון? הירשם',
                },
                forgotten_password: {
                  email_label: 'כתובת אימייל',
                  password_label: 'סיסמה',
                  email_input_placeholder: 'כתובת האימייל שלך',
                  button_label: 'שלח הוראות איפוס סיסמה',
                  loading_button_label: 'שולח הוראות...',
                  link_text: 'שכחת סיסמה?',
                },
              },
            }}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
