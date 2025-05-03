import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { createUserProfile, calculateTargets, createOrUpdateUserTargets } from '@/lib/target-service'
import { TargetSummary } from './TargetSummary'
import type { UserProfile, UserTargets } from '@/types'

export default function UserQuestionnaire() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [calculatedTargets, setCalculatedTargets] = useState<UserTargets | null>(null)

  const [profile, setProfile] = useState<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>({
    height: 0,
    weight: 0,
    target_weight: 0,
    age: 0,
    gender: 'male',
    activity_level: 'sedentary',
    weight_goal: 'maintain',
    weight_rate: 0.25,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsSubmitting(true)

      // קביעת המטרה בהתאם למשקל הנוכחי והיעד
      const weightGoal = profile.target_weight < profile.weight ? 'loss' as const : 
                        profile.target_weight > profile.weight ? 'gain' as const : 
                        'maintain' as const

      const updatedProfile = {
        ...profile,
        weight_goal: weightGoal
      }

      // שמירת פרופיל המשתמש
      await createUserProfile(user.id, updatedProfile)

      // חישוב וקביעת היעדים
      const targets = calculateTargets(
        updatedProfile.height,
        updatedProfile.age,
        updatedProfile.gender,
        updatedProfile.activity_level,
        updatedProfile.weight_goal,
        updatedProfile.weight_rate,
        updatedProfile.weight
      )

      await createOrUpdateUserTargets(user.id, targets)

      // שמירת היעדים להצגה בסיכום
      setCalculatedTargets(targets)
      setShowSummary(true)

    } catch (error) {
      console.error('Error creating profile:', error)
      toast({
        title: 'שגיאה!',
        description: 'אירעה שגיאה ביצירת הפרופיל',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateEstimatedTime = () => {
    if (profile.weight === 0 || profile.target_weight === 0) return null
    const weightDiff = Math.abs(profile.target_weight - profile.weight)
    const weeksToGoal = weightDiff / profile.weight_rate
    return `${Math.ceil(weeksToGoal)} שבועות`
  }

  if (showSummary && calculatedTargets) {
    return (
      <div className="p-4" dir="rtl">
        <TargetSummary 
          profile={{ ...profile, id: user?.id || '' }}
          targets={calculatedTargets}
        />
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/')}
          >
            המשך לדף הבית
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background" dir="rtl">
      <Card className="w-full max-w-md bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">שאלון משתמש חדש</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="height">גובה (בס"מ)</Label>
              <Input
                id="height"
                type="number"
                min={100}
                max={250}
                required
                value={profile.height || ''}
                onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">משקל נוכחי (בק"ג)</Label>
              <Input
                id="weight"
                type="number"
                min={30}
                max={300}
                step={0.1}
                required
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_weight">משקל יעד (בק"ג)</Label>
              <Input
                id="target_weight"
                type="number"
                min={30}
                max={300}
                step={0.1}
                required
                value={profile.target_weight || ''}
                onChange={(e) => setProfile({ ...profile, target_weight: Number(e.target.value) })}
              />
              {calculateEstimatedTime() && (
                <div className="text-sm text-muted-foreground mt-1">
                  זמן משוער להשגת היעד: {calculateEstimatedTime()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">גיל</Label>
              <Input
                id="age"
                type="number"
                min={16}
                max={120}
                required
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>מין</Label>
              <RadioGroup
                value={profile.gender}
                onValueChange={(value: 'male' | 'female') => setProfile({ ...profile, gender: value })}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">זכר</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">נקבה</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>רמת פעילות גופנית</Label>
              <Select
                value={profile.activity_level}
                onValueChange={(value: UserProfile['activity_level']) =>
                  setProfile({ ...profile, activity_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">יושבני (ללא פעילות גופנית)</SelectItem>
                  <SelectItem value="light">קל (1-2 אימונים בשבוע)</SelectItem>
                  <SelectItem value="moderate">בינוני (3-5 אימונים בשבוע)</SelectItem>
                  <SelectItem value="active">פעיל (6-7 אימונים בשבוע)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>קצב שינוי משקל רצוי</Label>
              <Select
                value={String(profile.weight_rate)}
                onValueChange={(value) =>
                  setProfile({ ...profile, weight_rate: Number(value) as 0.25 | 0.5 })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25 ק"ג בשבוע</SelectItem>
                  <SelectItem value="0.5">0.5 ק"ג בשבוע</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'מחשב ושומר...' : 'שמירה והמשך'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
