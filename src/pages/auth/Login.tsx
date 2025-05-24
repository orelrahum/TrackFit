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
  const from = location.state?.from?.pathname || '/home'

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
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-background auth-container pt-8 pb-8" dir="rtl">
      <Card className="w-full max-w-md auth-form bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">ברוכים הבאים ל-TrackFit</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
                dark: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#60a5fa',
                    inputBackground: 'hsl(220 10% 22%)',
                    inputBorder: 'hsl(220 10% 30%)',
                    inputText: 'hsl(220 10% 98%)',
                    inputPlaceholder: 'hsl(220 10% 70%)',
                    defaultButtonBackground: '#4f46e5',
                    defaultButtonBackgroundHover: '#4338ca',
                    defaultButtonText: 'white',
                    defaultButtonBorder: 'transparent',
                    anchorTextColor: 'hsl(220 10% 80%)',
                    anchorTextHoverColor: 'hsl(220 10% 98%)',
                    dividerBackground: 'hsl(220 10% 30%)',
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
            redirectTo={`${window.location.origin}/TrackFit/auth/callback`}
          />
        </CardContent>
      </Card>
    </div>
  )
}
