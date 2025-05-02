import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getOrCreateMealGroup, addMealToGroup, deleteMeal, getMealsForDate, updateMeal, deleteEmptyMealGroups } from "@/lib/meal-service";
import DateNavigation from "@/components/DateNavigation";
import DailySummary from "@/components/DailySummary";
import MealList from "@/components/MealList";
import AddEditMealDialog from "@/components/AddEditMealDialog";
import { DayData, MealGroup, Meal } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { calculateTotalNutrients } from "@/lib/meal-utils";

const HomePage = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dayData, setDayData] = useState<DayData>({
    date: currentDate.toISOString().split('T')[0],
    nutrients: {
      calories: { amount: 0, target: 2000 },
      protein: { amount: 0, target: 150 },
      carbs: { amount: 0, target: 250 },
      fat: { amount: 0, target: 70 }
    },
    meals: []
  });

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>(undefined);

  const handleAddMeal = () => {
    setSelectedMeal(undefined);
    setIsDialogOpen(true);
  };

  const handleAddWithAI = () => {
    toast({
      title: "פתיחת הוספה עם AI",
      description: "בגרסה מלאה של האפליקציה, כאן תופעל פונקציית הוספה עם AI",
    });
  };

  const handleEditMeal = (id: string) => {
    const meal = dayData.meals
      .flatMap(group => group.meals)
      .find(meal => meal.id === id);
    
    if (meal) {
      setSelectedMeal(meal);
      setIsDialogOpen(true);
    }
  };

  // Load meals when date changes
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const groups = await getMealsForDate(dateStr);
        const totals = calculateTotalNutrients(groups);
        setDayData(prev => ({
          ...prev,
          date: dateStr,
          meals: groups,
          nutrients: {
            calories: { ...prev.nutrients.calories, amount: totals.calories },
            protein: { ...prev.nutrients.protein, amount: totals.protein },
            carbs: { ...prev.nutrients.carbs, amount: totals.carbs },
            fat: { ...prev.nutrients.fat, amount: totals.fat }
          }
        }));
      } catch (error) {
        console.error('Error loading meals:', error);
        toast({
          title: "שגיאה בטעינת ארוחות",
          description: "אנא נסה שוב",
          variant: "destructive",
        });
      }
    };
    loadMeals();
  }, [currentDate]);

  const handleSaveMeal = async (mealData: Partial<Meal>) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (selectedMeal) {
        // עריכת ארוחה קיימת
        await updateMeal(selectedMeal.id, mealData);
        
        // Refresh data from server
        const groups = await getMealsForDate(dateStr);
        const totals = calculateTotalNutrients(groups);
        setDayData(prev => ({
          ...prev,
          meals: groups,
          nutrients: {
            calories: { ...prev.nutrients.calories, amount: totals.calories },
            protein: { ...prev.nutrients.protein, amount: totals.protein },
            carbs: { ...prev.nutrients.carbs, amount: totals.carbs },
            fat: { ...prev.nutrients.fat, amount: totals.fat }
          }
        }));

        toast({
          title: "הארוחה נערכה בהצלחה"
        });
      } else {
        // הוספת ארוחה חדשה
        const mealGroupId = await getOrCreateMealGroup(dateStr);
        await addMealToGroup(mealGroupId, mealData);

        // Refresh meals data
        const groups = await getMealsForDate(dateStr);
        const totals = calculateTotalNutrients(groups);
        setDayData(prev => ({
          ...prev,
          meals: groups,
          nutrients: {
            calories: { ...prev.nutrients.calories, amount: totals.calories },
            protein: { ...prev.nutrients.protein, amount: totals.protein },
            carbs: { ...prev.nutrients.carbs, amount: totals.carbs },
            fat: { ...prev.nutrients.fat, amount: totals.fat }
          }
        }));

        toast({
          title: "הארוחה נוספה בהצלחה"
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בשמירת הארוחה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Delete from Supabase
      await deleteMeal(id);
      
      // Delete empty meal groups
      await deleteEmptyMealGroups(dateStr);
      
      // Refresh data from server
      const groups = await getMealsForDate(dateStr);
      const totals = calculateTotalNutrients(groups);
      
      setDayData(prev => ({
        ...prev,
        meals: groups,
        nutrients: {
          calories: { ...prev.nutrients.calories, amount: totals.calories },
          protein: { ...prev.nutrients.protein, amount: totals.protein },
          carbs: { ...prev.nutrients.carbs, amount: totals.carbs },
          fat: { ...prev.nutrients.fat, amount: totals.fat }
        }
      }));
    
      toast({
        title: "הארוחה נמחקה בהצלחה",
        description: "הערכים התזונתיים עודכנו בהתאם",
      });
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "שגיאה במחיקת הארוחה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-8">
        <header className="bg-white shadow-sm py-4 mb-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-blue-600">TrackFit</div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">מעקב תזונה יומי</div>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await signOut();
                      if (error) {
                        toast({
                          title: "שגיאה בהתנתקות",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        navigate("/auth/login", { replace: true });
                      }
                    } catch (err) {
                      toast({
                        title: "שגיאה בהתנתקות",
                        description: "אנא נסה שוב",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium rounded-md hover:bg-red-50 transition-colors"
                >
                  התנתק
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4">
          <DateNavigation 
            currentDate={currentDate} 
            onPrevDay={handlePrevDay} 
            onNextDay={handleNextDay} 
          />
          
          <div className="space-y-6">
            <DailySummary nutrients={dayData.nutrients} />
            <MealList 
              meals={dayData.meals}
              onAddMeal={handleAddMeal}
              onAddWithAI={handleAddWithAI}
              onEditMeal={handleEditMeal}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
        </main>
      </div>
      
      <AddEditMealDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveMeal}
        meal={selectedMeal}
      />
    </>
  );
};

export default HomePage;
