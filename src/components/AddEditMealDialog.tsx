import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DBFood, Meal, MealGroup } from "@/types";
import { searchFoods, calculateNutrition, getAllFoods } from "@/lib/food-service";
import { getMealsForDate } from "@/lib/meal-service";

interface AddEditMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Partial<Meal>, groupId: string) => void;
  meal?: Meal;
  currentDate: string;
  preSelectedGroupId?: string;
  isAddFoodToMeal?: boolean;
}

const AddEditMealDialog = ({ isOpen: dialogOpen, onClose, onSave, meal, currentDate, preSelectedGroupId, isAddFoodToMeal }: AddEditMealDialogProps) => {
  const [selectedFood, setSelectedFood] = useState<DBFood | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(preSelectedGroupId || "");
  const [mealGroups, setMealGroups] = useState<MealGroup[]>([]);
  const [formData, setFormData] = useState<Partial<Meal>>({
    name: meal?.name || "",
    calories: meal?.calories || 0,
    protein: meal?.protein || 0,
    carbs: meal?.carbs || 0,
    fat: meal?.fat || 0,
    weight: meal?.weight || 0,
    unit: meal?.unit || "גרמים",
    food_id: meal?.food_id,
    image_url: meal?.image_url
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DBFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMealGroups = useCallback(async () => {
    try {
      const groups = await getMealsForDate(currentDate);
      setMealGroups(groups);
      // If editing an existing meal, find its group
      if (meal) {
        const group = groups.find(g => g.meals.some(m => m.id === meal.id));
        if (group) {
          setSelectedGroupId(group.id);
        }
      }
    } catch (error) {
      console.error('Error loading meal groups:', error);
    }
  }, [currentDate, meal]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (dialogOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFood(null);
      setSelectedGroupId(preSelectedGroupId || "new");
      setFormData({
        name: meal?.name || "",
        calories: meal?.calories || 0,
        protein: meal?.protein || 0,
        carbs: meal?.carbs || 0,
        fat: meal?.fat || 0,
        weight: meal?.weight || 0,
        unit: meal?.unit || "גרמים",
        food_id: meal?.food_id,
        image_url: meal?.image_url
      });
      loadMealGroups();
    }
  }, [dialogOpen, meal, loadMealGroups]);

  // Load all foods when dropdown is opened
  useEffect(() => {
    if (comboboxOpen && searchResults.length === 0) {
      loadAllFoods();
    }
  }, [comboboxOpen]);

  // Search effect
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      try {
        const foodsData = await searchFoods(searchQuery);
        setSearchResults(foodsData.sort((a, b) => a.name_he.localeCompare(b.name_he, 'he')));
      } catch (error) {
        console.error('Error searching foods:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const loadAllFoods = async () => {
    setLoading(true);
    try {
      const foods = await getAllFoods();
      setSearchResults(foods.sort((a, b) => a.name_he.localeCompare(b.name_he, 'he')));
    } catch (error) {
      console.error('Error loading foods:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food: DBFood) => {
    setSelectedFood(food);
    
    // Always use גרמים as default unit, regardless of food_measurement_units
    const defaultUnit = "גרמים";

    try {
      const defaultWeight = (defaultUnit === "גרמים" || defaultUnit === "גרם") ? 100 : 1;
      const nutritionValues = calculateNutrition(food, defaultWeight, defaultUnit);
      setFormData({
        name: food.name_he,
        food_id: food.id,
        unit: defaultUnit,
        weight: defaultWeight,
        image_url: food.image_url,
        ...nutritionValues
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      // Set safe default values if calculation fails
      const defaultWeight = (defaultUnit === "גרמים" || defaultUnit === "גרם") ? 100 : 1;
      setFormData({
        name: food.name_he,
        unit: defaultUnit,
        weight: defaultWeight,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        image_url: food.image_url,
      });
    }
    setComboboxOpen(false);
  };

  const handleAmountChange = (amount: number) => {
    if (!selectedFood || !amount) return;
    
    try {
      const nutritionValues = calculateNutrition(selectedFood, amount, formData.unit || "גרמים");
      setFormData(prev => ({
        ...prev,
        weight: amount,
        ...nutritionValues
      }));
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      // Keep previous values but update weight
      setFormData(prev => ({
        ...prev,
        weight: amount
      }));
    }
  };

  const handleUnitChange = (unit: string) => {
    if (!selectedFood || !unit) return;
    
    // Set default weight based on unit
    const newWeight = (unit === "גרמים" || unit === "גרם") ? 100 : 1;
    
    try {
      const nutritionValues = calculateNutrition(selectedFood, newWeight, unit);
      setFormData(prev => ({
        ...prev,
        unit,
        weight: newWeight,
        ...nutritionValues
      }));
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      // Keep previous values but update unit and weight
      setFormData(prev => ({
        ...prev,
        unit,
        weight: newWeight
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId && !meal) {
      // If no group is selected and we're adding a new meal, create a new group
      onSave(formData, "new");
    } else {
      onSave(formData, selectedGroupId);
    }
    onClose();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {meal ? "עריכת מאכל" : isAddFoodToMeal ? "הוספת מאכל" : "הוספת ארוחה חדשה"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 flex-1">
          {!meal && !isAddFoodToMeal && (
            <div className="space-y-2">
              <Label>קבוצת ארוחה</Label>
              <Select 
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger className="flex flex-row-reverse justify-between">
                  <SelectValue>
                    {selectedGroupId === "new" ? "ארוחה חדשה" : mealGroups.find(g => g.id === selectedGroupId)?.name || "ארוחה חדשה"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-full min-w-[200px]" dir="rtl">
                  <div className="flex flex-col">
                    {mealGroups.map(group => (
                      <SelectItem key={group.id} value={group.id} className="text-right flex flex-row-reverse justify-between">
                        {group.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-right flex flex-row-reverse justify-between">
                      ארוחה חדשה
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>חיפוש מאכל</Label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setComboboxOpen(!comboboxOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setComboboxOpen(!comboboxOpen);
                  }
                }}
                className={`relative w-full border rounded-lg pl-3 pr-10 py-2 text-right shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  comboboxOpen ? 'ring-2 ring-blue-500' : ''
                } flex items-center gap-2`}
                aria-expanded={comboboxOpen}
                aria-haspopup="listbox"
              >
                {selectedFood ? (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <span>{selectedFood.name_he}</span>
                    {selectedFood.image_url && (
                      <img
                        src={selectedFood.image_url}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground w-full text-right">בחר מאכל</span>
                )}
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      comboboxOpen ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </span>
              </button>
              
              {comboboxOpen && (
                <div className="absolute z-50 w-[calc(100%-8px)] mt-1">
                  <div className="bg-card border rounded-lg shadow-lg">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setComboboxOpen(false);
                        } else if (e.key === 'Enter' && searchResults.length > 0) {
                          handleFoodSelect(searchResults[0]);
                        }
                      }}
                      placeholder="חפש מאכל..."
                      className="border-0 border-b rounded-none focus:ring-0 text-right"
                      autoFocus
                    />
                    <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                      {loading ? (
                        <div className="p-2 text-center text-muted-foreground" role="status">
                          <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full ml-2" />
                          טוען נתונים...
                        </div>
                      ) : !searchResults.length ? (
                        <div className="p-2 text-center text-muted-foreground">לא נמצאו תוצאות</div>
                      ) : (
                        searchResults.map(food => (
                          <button
                            key={food.id}
                            type="button"
                            className="w-full text-right px-3 py-2 hover:bg-muted border-b last:border-0 flex flex-row-reverse items-center gap-2"
                            onClick={() => handleFoodSelect(food)}
                          >
                            {food.image_url && (
                              <img
                                src={food.image_url}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            )}
                            <div className="flex-1 text-right">
                              <div className="font-medium">{food.name_he}</div>
                              <div className="text-sm text-muted-foreground">{food.calories} קק"ל ל-100 גרמים</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedFood && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">כמות</Label>
                  <Input
                    id="weight"
                    type="number"
                    dir="rtl"
                    className="text-right"
                    value={formData.weight}
                    onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">יחידת מידה</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={handleUnitChange}
                  >
                    <SelectTrigger className="flex flex-row-reverse justify-between">
                      <SelectValue defaultValue="גרמים" />
                    </SelectTrigger>
                    <SelectContent align="end" className="w-full min-w-[200px]" dir="rtl">
                      <div className="flex flex-col">
                        <SelectItem value="גרמים" className="text-right flex flex-row-reverse justify-between">
                          גרמים (1g)
                        </SelectItem>
                        {selectedFood.food_measurement_units?.filter(mu => mu.unit !== "גרמים").map(mu => (
                          <SelectItem key={mu.unit} value={mu.unit} className="text-right flex flex-row-reverse justify-between">
                            {mu.unit} ({mu.grams}g)
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>קלוריות</Label>
                  <div className="p-2 bg-muted rounded-md text-right">
                    {Math.round(formData.calories || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>חלבון (גרמים)</Label>
                  <div className="p-2 bg-muted rounded-md text-right">
                    {Math.round(formData.protein || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>פחמימות (גרמים)</Label>
                  <div className="p-2 bg-muted rounded-md text-right">
                    {Math.round(formData.carbs || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>שומן (גרמים)</Label>
                  <div className="p-2 bg-muted rounded-md text-right">
                    {Math.round(formData.fat || 0)}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 space-x-reverse bg-background pt-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={!selectedFood}>
              {meal ? "שמור שינויים" : isAddFoodToMeal ? "הוסף מאכל" : "הוסף ארוחה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditMealDialog;
