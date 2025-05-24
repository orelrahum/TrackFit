import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getOrCreateMealGroup, addMealToGroup, deleteMeal, getMealsForDate, updateMeal, deleteEmptyMealGroups, updateMealGroup, deleteMealGroup } from "@/lib/meal-service"
import { WaterTracker } from "@/components/WaterTracker"
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
      calories: { amount: 0, target: 0 },
      protein: { amount: 0, target: 0 },
      carbs: { amount: 0, target: 0 },
      fat: { amount: 0, target: 0 }
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

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("new");
  const [isAddFoodToMeal, setIsAddFoodToMeal] = useState(false);

  const handleAddMeal = () => {
    setSelectedMeal(undefined);
    setIsAddFoodToMeal(false);
    setIsDialogOpen(true);
  };

  const handleAddFoodToGroup = (groupId: string) => {
    setSelectedMeal(undefined);
    setSelectedGroupId(groupId);
    setIsAddFoodToMeal(true);
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

  const handleSaveMeal = async (mealData: Partial<Meal>, groupId: string) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (selectedMeal) {
        // עריכת ארוחה קיימת
        await updateMeal(selectedMeal.id, mealData);
      } else {
        // הוספת ארוחה חדשה
        const mealGroupId = groupId === "new" ? 
          await getOrCreateMealGroup(dateStr) : 
          groupId;
        await addMealToGroup(mealGroupId, mealData);
      }

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
        title: selectedMeal ? "הארוחה נערכה בהצלחה" : "הארוחה נוספה בהצלחה"
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירת הארוחה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleEditMealGroup = async (groupId: string, data: { name: string }) => {
    try {
      await updateMealGroup(groupId, data);
      
      const dateStr = currentDate.toISOString().split('T')[0];
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
        title: "שם הקבוצה עודכן בהצלחה"
      });
    } catch (error) {
      console.error('Error updating meal group:', error);
      toast({
        title: "שגיאה בעדכון שם הקבוצה",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Delete the group and its meals
      await deleteMealGroup(groupId);
      
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
        title: "הקבוצה נמחקה בהצלחה",
        description: "הערכים התזונתיים עודכנו בהתאם",
      });
    } catch (error) {
      console.error('Error deleting meal group:', error);
      toast({
        title: "שגיאה במחיקת הקבוצה",
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
      <div className="h-screen w-screen bg-background">
        {/* Header is now handled globally in App.tsx */}
        <main className="p-6 h-screen">
          <DateNavigation 
            currentDate={currentDate} 
            onPrevDay={handlePrevDay} 
            onNextDay={handleNextDay}
            onTodayClick={handleTodayClick}
          />
          
          <div className="space-y-6 md:space-y-0 md:flex md:gap-6 w-full mt-6">
            <div className="md:w-2/3">
              <MealList
                meals={dayData.meals}
                onAddMeal={handleAddMeal}
                onAddWithAI={handleAddWithAI}
                onEditMeal={handleEditMeal}
                onDeleteMeal={handleDeleteMeal}
                onEditGroup={handleEditMealGroup}
                onDeleteGroup={handleDeleteGroup}
                onAddFoodToGroup={handleAddFoodToGroup}
              />
            </div>
            <div className="md:w-1/3 space-y-6">
              <DailySummary nutrients={dayData.nutrients} />
              <WaterTracker date={currentDate.toISOString().split('T')[0]} />
            </div>
          </div>
        </main>
      </div>
      
      <AddEditMealDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedGroupId("new");
          setIsAddFoodToMeal(false);
        }}
        onSave={handleSaveMeal}
        meal={selectedMeal}
        currentDate={currentDate.toISOString().split('T')[0]}
        preSelectedGroupId={selectedGroupId}
        isAddFoodToMeal={isAddFoodToMeal}
      />
    </>
  );
};

export default HomePage;
