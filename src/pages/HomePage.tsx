import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getOrCreateMealGroup, addMealToGroup, deleteMeal, getMealsForDate, updateMeal, deleteEmptyMealGroups, updateMealGroup, deleteMealGroup } from "@/lib/meal-service"
import { WaterTracker } from "@/components/WaterTracker"
import DailySummary from "@/components/DailySummary";
import MealList from "@/components/MealList";
import AddEditMealDialog from "@/components/AddEditMealDialog";
import { AddFoodDialog } from "@/components/AddFoodDialog";
import { DayData, MealGroup, Meal } from "@/types";
import { calculateTotalNutrients } from "@/lib/meal-utils";
import DateNavigation from "@/components/DateNavigation";

const HomePage = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState<DayData>(() => {
    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = local.getFullYear();
    const month = String(local.getMonth() + 1).padStart(2, '0');
    const day = String(local.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      nutrients: {
        calories: { amount: 0, target: 0 },
        protein: { amount: 0, target: 0 },
        carbs: { amount: 0, target: 0 },
        fat: { amount: 0, target: 0 }
      },
      meals: []
    };
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | undefined>(undefined);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("new");
  const [isAddFoodToMeal, setIsAddFoodToMeal] = useState(false);

  const loadMeals = async (dateStr: string) => {
    try {
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

  // Initial load on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Set initial date and title
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      document.title = `TrackFit - ${dateStr}`;
      await loadMeals(dateStr);
      
      // Update state with current date
      setDayData(prev => ({
        ...prev,
        date: dateStr
      }));
    };

    loadInitialData();
  }, []); // Run only once on mount

  // Watch for date changes through title updates
  useEffect(() => {
    const getDateFromTitle = (): string | null => {
      const dateStr = document.title.split(' - ')[1];
      return dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : null;
    };

    const observer = new MutationObserver(async () => {
      const dateStr = getDateFromTitle();
      if (dateStr && dateStr !== dayData.date) {
        await loadMeals(dateStr);
      }
    });

    observer.observe(document.querySelector('title')!, {
      subtree: true,
      characterData: true,
      childList: true
    });

    return () => observer.disconnect();
  }, [dayData.date]); // Re-run only when date changes

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

  const handleSaveMeal = async (mealData: Partial<Meal>, groupId: string) => {
    try {
      const dateStr = dayData.date;
      
      if (selectedMeal) {
        await updateMeal(selectedMeal.id, mealData);
      } else {
        const mealGroupId = groupId === "new" ? 
          await getOrCreateMealGroup(dateStr) : 
          groupId;
        await addMealToGroup(mealGroupId, mealData);
      }

      await loadMeals(dateStr);
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
      await loadMeals(dayData.date);
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
      await deleteMealGroup(groupId);
      await loadMeals(dayData.date);
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
      await deleteMeal(id);
      await loadMeals(dayData.date);
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
    <div className="fixed inset-0 pt-14 bg-background overflow-hidden flex flex-col">
      <main className="flex-1 min-h-0 px-2">
        {/* Mobile Layout */}
        <div className="block md:hidden h-full overflow-y-auto">
          <div className="space-y-2 pb-4">
            <div className="bg-card rounded-lg p-2 mb-1">
              <DateNavigation 
                currentDate={new Date(dayData.date)}
                onPrevDay={() => {
                const prevDay = new Date(dayData.date);
                prevDay.setDate(prevDay.getDate() - 1);
                const year = prevDay.getFullYear();
                const month = String(prevDay.getMonth() + 1).padStart(2, '0');
                const day = String(prevDay.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                document.title = `TrackFit - ${dateStr}`;
                loadMeals(dateStr);
              }}
              onNextDay={() => {
                const nextDay = new Date(dayData.date);
                nextDay.setDate(nextDay.getDate() + 1);
                const year = nextDay.getFullYear();
                const month = String(nextDay.getMonth() + 1).padStart(2, '0');
                const day = String(nextDay.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                document.title = `TrackFit - ${dateStr}`;
                loadMeals(dateStr);
              }}
              onTodayClick={() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                document.title = `TrackFit - ${dateStr}`;
                loadMeals(dateStr);
                }}
              />
            </div>
            <DailySummary nutrients={dayData.nutrients} />
            <WaterTracker date={dayData.date} />
            <div className="bg-card rounded-lg p-4">
              <AddFoodDialog />
            </div>
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
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:gap-3 w-full h-full">
          <div className="md:w-2/3 overflow-y-auto pr-1">
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
          <div className="md:w-1/3 space-y-2 overflow-y-auto pb-2">
            <DailySummary nutrients={dayData.nutrients} />
            <WaterTracker date={dayData.date} />
            <div className="bg-card rounded-lg p-4">
              <AddFoodDialog />
            </div>
          </div>
        </div>
      </main>
      
      <AddEditMealDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedGroupId("new");
          setIsAddFoodToMeal(false);
        }}
        onSave={handleSaveMeal}
        meal={selectedMeal}
        currentDate={dayData.date}
        preSelectedGroupId={selectedGroupId}
        isAddFoodToMeal={isAddFoodToMeal}
      />
    </div>
  );
};

export default HomePage;
