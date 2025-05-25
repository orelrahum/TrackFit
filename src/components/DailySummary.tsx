import { Nutrients } from "@/types"
import ProgressBar from "./ProgressBar"
import { useUserTargets } from "@/hooks/use-user-targets"
import { Skeleton } from "@/components/ui/skeleton"

interface DailySummaryProps {
  nutrients: {
    calories: { amount: number };
    protein: { amount: number };
    carbs: { amount: number };
    fat: { amount: number };
  }
}

const DailySummary = ({ nutrients }: DailySummaryProps) => {
  const { targets, isLoading, error } = useUserTargets()
  
  if (isLoading) {
    return (
      <div className="p-3 bg-card rounded-lg h-fit space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  if (error || !targets) {
    console.error('Target loading error:', error)
    // מקרה של שגיאה: נציג לפחות את הערכים הנוכחיים בלי היעדים
    return (
      <div className="p-3 bg-card rounded-lg h-fit">
        <div className="text-center text-red-500 mb-4">
          שגיאה בטעינת היעדים היומיים. מציג ערכים נוכחיים בלבד.
        </div>
        <div className="space-y-4">
          <div>קלוריות: {nutrients.calories.amount}</div>
          <div>חלבון: {nutrients.protein.amount} גרם</div>
          <div>פחמימות: {nutrients.carbs.amount} גרם</div>
          <div>שומן: {nutrients.fat.amount} גרם</div>
        </div>
      </div>
    )
  }

  if (!targets.calories || !targets.protein || !targets.carbs || !targets.fat) {
    console.error('Invalid target values:', targets)
    return (
      <div className="p-3 bg-card rounded-lg h-fit text-center text-red-500 dark:text-red-400">
        שגיאה: ערכי היעדים אינם תקינים
      </div>
    )
  }

  return (
    <div className="p-3 bg-card rounded-lg h-fit">
      <ProgressBar 
        current={nutrients.calories.amount}
        max={targets.calories}
        label="קלוריות"
        valueLabel={`${nutrients.calories.amount} / ${targets.calories} קק"ל`}
        colorClass="bg-progress-calories"
      />
      
      <ProgressBar 
        current={nutrients.protein.amount}
        max={targets.protein}
        label="חלבון"
        valueLabel={`${nutrients.protein.amount} / ${targets.protein} גרם`}
        colorClass="bg-progress-protein"
      />
      
      <ProgressBar 
        current={nutrients.carbs.amount}
        max={targets.carbs}
        label="פחמימות"
        valueLabel={`${nutrients.carbs.amount} / ${targets.carbs} גרם`}
        colorClass="bg-progress-carbs"
      />
      
      <ProgressBar 
        current={nutrients.fat.amount}
        max={targets.fat}
        label="שומן"
        valueLabel={`${nutrients.fat.amount} / ${targets.fat} גרם`}
        colorClass="bg-progress-fat"
      />
    </div>
  )
}

export default DailySummary
