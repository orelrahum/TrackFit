import type { UserProfile, UserTargets } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface TargetSummaryProps {
  profile: UserProfile
  targets: UserTargets
}

export function TargetSummary({ profile, targets }: TargetSummaryProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">היעדים היומיים שלך</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">יעדים תזונתיים:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>קלוריות:</span>
                <span className="font-medium">{targets.calories} קק"ל</span>
              </div>
              <div className="flex justify-between">
                <span>חלבון:</span>
                <span className="font-medium">{targets.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span>פחמימות:</span>
                <span className="font-medium">{targets.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>שומן:</span>
                <span className="font-medium">{targets.fat}g</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">פרטי משקל:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>משקל נוכחי:</span>
                <span className="font-medium">{profile.weight} ק"ג</span>
              </div>
              <div className="flex justify-between">
                <span>משקל יעד:</span>
                <span className="font-medium">{profile.target_weight} ק"ג</span>
              </div>
              <div className="flex justify-between">
                <span>קצב שינוי:</span>
                <span className="font-medium">{profile.weight_rate} ק"ג בשבוע</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">פרטים נוספים:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>רמת פעילות:</span>
                <span className="font-medium">
                  {profile.activity_level === 'sedentary' && 'יושבני'}
                  {profile.activity_level === 'light' && 'קל (1-2 אימונים בשבוע)'}
                  {profile.activity_level === 'moderate' && 'בינוני (3-5 אימונים בשבוע)'}
                  {profile.activity_level === 'active' && 'פעיל (6-7 אימונים בשבוע)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>מטרה:</span>
                <span className="font-medium">
                  {profile.weight_goal === 'loss' && 'ירידה במשקל'}
                  {profile.weight_goal === 'gain' && 'עליה במשקל'}
                  {profile.weight_goal === 'maintain' && 'שמירה על המשקל'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          פתח את הקונסול כדי לראות את פירוט החישוב המלא
        </div>
      </CardContent>
    </Card>
  )
}
