export const authErrorMessages = {
  'Invalid email': 'כתובת אימייל לא תקינה',
  'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
  'User already registered': 'משתמש כבר קיים במערכת',
  'Invalid login credentials': 'פרטי התחברות שגויים',
  'Invalid verification code': 'קוד אימות שגוי',
  'Email link is invalid or has expired': 'קישור האימות לא תקין או שפג תוקפו'
}

export const getAuthErrorMessage = (error: string) => {
  return authErrorMessages[error as keyof typeof authErrorMessages] || error
}
