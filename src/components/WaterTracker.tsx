import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { getWaterLogForDate, updateWaterLog, clearWaterLog } from "@/lib/water-service"
import { WaterLog } from "@/types"

const DAILY_GOAL = 2500 // ml
const QUICK_ADD_AMOUNTS = [
  { label: "כוס קטנה", amount: 200 },
  { label: "פחית/בקבוק קטן", amount: 330 },
  { label: "בקבוק רגיל", amount: 500 },
]

interface WaterTrackerProps {
  date: string;
}

export function WaterTracker({ date }: WaterTrackerProps) {
  const [todayLog, setTodayLog] = useState<WaterLog | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const currentAmount = todayLog?.amount || 0
  const progress = (currentAmount / DAILY_GOAL) * 100

  useEffect(() => {
    const loadTodayLog = async () => {
      try {
        const log = await getWaterLogForDate(date)
        setTodayLog(log)
      } catch (error) {
        console.error("Error loading today's water log:", error)
      }
    }

    loadTodayLog()
  }, [date])

  const handleAddWater = async (amount: number) => {
    if (amount <= 0) return
    setIsLoading(true)
    
    try {
      const newAmount = (todayLog?.amount || 0) + amount
      await updateWaterLog(date, newAmount)
      
      const updatedLog = await getWaterLogForDate(date)
      setTodayLog(updatedLog)
      
    } catch (error) {
      console.error("Error updating water amount:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customAmount)
    if (!isNaN(amount)) {
      handleAddWater(amount)
      setCustomAmount("")
    }
  }

  return (
    <Card dir="rtl" className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">מעקב שתייה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentAmount} מ"ל</span>
            <span>{DAILY_GOAL} מ"ל</span>
          </div>
          <Progress value={progress} />
          {currentAmount > 0 && (
            <div className="flex justify-center mt-2">
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await clearWaterLog(date);
                    setTodayLog(null);
                  } catch (error) {
                    console.error("Error clearing water log:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                נקה את השתייה של היום
              </Button>
            </div>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_ADD_AMOUNTS.map(({ label, amount }) => (
            <Button
              key={amount}
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleAddWater(amount)}
            >
              {label} ({amount} מ"ל)
            </Button>
          ))}
        </div>

        {/* Custom Amount Form */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            type="number"
            placeholder='הזן כמות במ"ל'
            value={customAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomAmount(e.target.value)}
            min="1"
            className="text-right"
          />
          <Button type="submit" disabled={isLoading || !customAmount}>
            הוסף
          </Button>
        </form>

      </CardContent>
    </Card>
  )
}
