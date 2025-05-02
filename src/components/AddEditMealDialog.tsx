import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DBFood, Meal } from "@/types";
import { searchFoods, calculateNutrition, getAllFoods } from "@/lib/food-service";

interface AddEditMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Partial<Meal>) => void;
  meal?: Meal;
}

const AddEditMealDialog = ({ isOpen: dialogOpen, onClose, onSave, meal }: AddEditMealDialogProps) => {
  const [selectedFood, setSelectedFood] = useState<DBFood | null>(null);
  const [formData, setFormData] = useState<Partial<Meal>>({
    name: meal?.name || "",
    calories: meal?.calories || 0,
    protein: meal?.protein || 0,
    carbs: meal?.carbs || 0,
    fat: meal?.fat || 0,
    weight: meal?.weight || 0,
    unit: meal?.unit || "גרם",
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

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (dialogOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFood(null);
      setFormData({
        name: meal?.name || "",
        calories: meal?.calories || 0,
        protein: meal?.protein || 0,
        carbs: meal?.carbs || 0,
        fat: meal?.fat || 0,
        weight: meal?.weight || 0,
        unit: meal?.unit || "גרם",
        food_id: meal?.food_id,
        image_url: meal?.image_url
      });
    }
  }, [dialogOpen, meal]);

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
    
    // Always default to גרם if available, otherwise use first available unit
    let defaultUnit = "גרם";
    if (food.food_measurement_units) {
      const hasGrams = food.food_measurement_units.some(mu => mu.unit === "גרם");
      if (!hasGrams && food.food_measurement_units.length > 0) {
        defaultUnit = food.food_measurement_units[0].unit;
      }
    }

    try {
      const nutritionValues = calculateNutrition(food, 100, defaultUnit);
      setFormData({
        name: food.name_he,
        food_id: food.id,
        unit: defaultUnit,
        weight: 100, // Reset to 100 as default amount
        image_url: food.image_url,
        ...nutritionValues
      });
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      // Set safe default values if calculation fails
      setFormData({
        name: food.name_he,
        unit: defaultUnit,
        weight: 100,
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
      const nutritionValues = calculateNutrition(selectedFood, amount, formData.unit || "גרם");
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
    
    try {
      const nutritionValues = calculateNutrition(selectedFood, formData.weight || 100, unit);
      setFormData(prev => ({
        ...prev,
        unit,
        ...nutritionValues
      }));
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      // Keep previous values but update unit
      setFormData(prev => ({
        ...prev,
        unit
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {meal ? "עריכת ארוחה" : "הוספת ארוחה חדשה"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center gap-2">
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
                    <span>{selectedFood.name_he}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">בחר מאכל</span>
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
                <div className="absolute z-50 w-full mt-1">
                  <div className="bg-white border rounded-lg shadow-lg">
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
                      className="border-0 border-b rounded-none focus:ring-0"
                      autoFocus
                    />
                    <div className="max-h-[300px] overflow-y-auto">
                      {loading ? (
                        <div className="p-2 text-center text-gray-500" role="status">
                          <div className="inline-block animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full ml-2" />
                          טוען נתונים...
                        </div>
                      ) : !searchResults.length ? (
                        <div className="p-2 text-center text-gray-500">לא נמצאו תוצאות</div>
                      ) : (
                        searchResults.map(food => (
                          <button
                            key={food.id}
                            type="button"
                            className="w-full text-right px-3 py-2 hover:bg-gray-100 border-b last:border-0 flex items-center gap-2"
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
                            <div className="flex-1">
                              <div className="font-medium">{food.name_he}</div>
                              <div className="text-sm text-gray-500">{food.calories} קק"ל ל-100 גרם</div>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedFood.food_measurement_units?.map(mu => (
                        <SelectItem key={mu.unit} value={mu.unit}>
                          {mu.unit} ({mu.grams}g)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>קלוריות</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {Math.round(formData.calories || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>חלבון (גרם)</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {Math.round(formData.protein || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>פחמימות (גרם)</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {Math.round(formData.carbs || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>שומן (גרם)</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {Math.round(formData.fat || 0)}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={!selectedFood}>
              {meal ? "שמור שינויים" : "הוסף ארוחה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditMealDialog;
