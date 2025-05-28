import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { PlusCircle, Plus, Minus, X } from "lucide-react"
import { addFood, addFoodMeasurementUnits } from '../lib/food-service'
import { toast } from './ui/use-toast'

interface MeasurementUnit {
  unit: string;
  grams: number;
}

export function AddFoodDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nameHe, setNameHe] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [units, setUnits] = useState<MeasurementUnit[]>([
    { unit: 'גרמים', grams: 1 }
  ])

  const resetForm = () => {
    setNameHe('')
    setNameEn('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setImageUrl('')
    setUnits([{ unit: 'גרמים', grams: 1 }])
  }

  const addUnit = () => {
    setUnits([...units, { unit: '', grams: 0 }])
  }

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const updateUnit = (index: number, field: keyof MeasurementUnit, value: string) => {
    const newUnits = [...units]
    if (field === 'grams') {
      newUnits[index][field] = parseFloat(value) || 0
    } else {
      newUnits[index][field] = value
    }
    setUnits(newUnits)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      // Validate inputs
      if (!nameHe || !nameEn || !calories || !protein || !carbs || !fat) {
        throw new Error('נא למלא את כל השדות החובה')
      }

      const foodData = {
        name_he: nameHe,
        name_en: nameEn,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        image_url: imageUrl || undefined
      }

      // Add food first
      const newFood = await addFood(foodData)

      // Then add measurement units
      await addFoodMeasurementUnits(newFood.id, units)

      toast({
        title: "המוצר נוסף בהצלחה",
        description: `${nameHe} נוסף למאגר המוצרים`
      })

      setIsOpen(false)
      resetForm()

    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בהוספת המוצר"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="ml-2 h-4 w-4" />
          הוסף מוצר חדש
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>הוספת מוצר חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameHe">שם המוצר בעברית</Label>
              <Input
                id="nameHe"
                value={nameHe}
                onChange={(e) => setNameHe(e.target.value)}
                placeholder="לדוגמה: לחם"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">שם המוצר באנגלית</Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="For example: Bread"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">קלוריות ל-100 גרם</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">חלבון ל-100 גרם</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">פחמימות ל-100 גרם</Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">שומן ל-100 גרם</Label>
              <Input
                id="fat"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">קישור לתמונה (אופציונלי)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>יחידות מידה</Label>
              <Button type="button" variant="outline" size="sm" onClick={addUnit}>
                <Plus className="h-4 w-4 ml-2" />
                הוסף יחידת מידה
              </Button>
            </div>
            
            <div className="space-y-4">
              {units.map((unit, index) => (
                <div key={index} className="flex items-end gap-4">
                  <div className="space-y-2 flex-1">
                    <Label>שם היחידה</Label>
                    <Input
                      value={unit.unit}
                      onChange={(e) => updateUnit(index, 'unit', e.target.value)}
                      placeholder="לדוגמה: כוס"
                      required
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>משקל בגרמים</Label>
                    <Input
                      type="number"
                      value={unit.grams || ''}
                      onChange={(e) => updateUnit(index, 'grams', e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUnit(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <span className="loading loading-spinner"></span>}
              הוסף מוצר
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
