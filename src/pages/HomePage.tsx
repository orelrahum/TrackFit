
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import DateNavigation from "@/components/DateNavigation";
import DailySummary from "@/components/DailySummary";
import MealList from "@/components/MealList";
import AddEditMealDialog from "@/components/AddEditMealDialog";
import { mockData } from "@/data/mockData";
import { DayData, MealGroup, Meal } from "@/types";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dayData, setDayData] = useState<DayData>(mockData);

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
    
    // בפרויקט אמיתי כאן היינו מבצעים בקשה לשרת עם התאריך החדש
    toast({
      title: "מציג נתונים מהיום הקודם",
      description: "בגרסה מלאה של האפליקציה, כאן יוצגו הנתונים האמיתיים מהיום הקודם",
    });
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    
    // לא מאפשר לבחור תאריך עתידי מהיום הנוכחי
    if (nextDay <= new Date()) {
      setCurrentDate(nextDay);
      // בפרויקט אמיתי כאן היינו מבצעים בקשה לשרת עם התאריך החדש
      toast({
        title: "מציג נתונים מהיום הבא",
        description: "בגרסה מלאה של האפליקציה, כאן יוצגו הנתונים האמיתיים מהיום הבא",
      });
    } else {
      toast({
        title: "לא ניתן לצפות בתאריך עתידי",
        description: "ניתן לצפות רק בימים שכבר עברו",
        variant: "destructive",
      });
    }
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

  const handleSaveMeal = (mealData: Partial<Meal>) => {
    if (selectedMeal) {
      // עריכת ארוחה קיימת
      const updatedMealGroups = dayData.meals.map(group => ({
        ...group,
        meals: group.meals.map(meal => 
          meal.id === selectedMeal.id 
            ? { ...meal, ...mealData }
            : meal
        )
      }));

      setDayData({
        ...dayData,
        meals: updatedMealGroups
      });

      toast({
        title: "הארוחה נערכה בהצלחה",
      });
    } else {
      // הוספת ארוחה חדשה
      const newMeal: Meal = {
        id: uuidv4(),
        name: mealData.name || "",
        calories: mealData.calories || 0,
        protein: mealData.protein || 0,
        carbs: mealData.carbs || 0,
        fat: mealData.fat || 0,
        weight: mealData.weight,
        unit: mealData.unit,
        image_url: mealData.image_url,
      };

      // מוסיף את הארוחה לקבוצה הראשונה
      const updatedMealGroups = [...dayData.meals];
      if (updatedMealGroups.length > 0) {
        updatedMealGroups[0] = {
          ...updatedMealGroups[0],
          meals: [...updatedMealGroups[0].meals, newMeal]
        };
      } else {
        updatedMealGroups.push({
          id: uuidv4(),
          name: "ארוחה חדשה",
          meals: [newMeal]
        });
      }

      setDayData({
        ...dayData,
        meals: updatedMealGroups
      });

      toast({
        title: "הארוחה נוספה בהצלחה",
      });
    }
  };

  const handleDeleteMeal = (id: string) => {
    // מדמה מחיקת ארוחה
    let updatedMealGroups = [...dayData.meals];
    let deletedMealData = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // מחפש את הארוחה בכל הקבוצות
    updatedMealGroups = updatedMealGroups.map(group => {
      const mealIndex = group.meals.findIndex(meal => meal.id === id);
      
      if (mealIndex !== -1) {
        // שומר את ערכי התזונה של הארוחה שנמחקה
        const deletedMeal = group.meals[mealIndex];
        deletedMealData = {
          calories: deletedMeal.calories,
          protein: deletedMeal.protein,
          carbs: deletedMeal.carbs,
          fat: deletedMeal.fat
        };
        
        // מוחק את הארוחה מהקבוצה
        const updatedMeals = [...group.meals];
        updatedMeals.splice(mealIndex, 1);
        return { ...group, meals: updatedMeals };
      }
      
      return group;
    });
    
    // מסנן קבוצות ריקות
    updatedMealGroups = updatedMealGroups.filter(group => group.meals.length > 0);
    
    // מעדכן את הערכים התזונתיים
    const updatedNutrients = {
      calories: {
        ...dayData.nutrients.calories,
        amount: Math.max(0, dayData.nutrients.calories.amount - deletedMealData.calories)
      },
      protein: {
        ...dayData.nutrients.protein,
        amount: Math.max(0, dayData.nutrients.protein.amount - deletedMealData.protein)
      },
      carbs: {
        ...dayData.nutrients.carbs,
        amount: Math.max(0, dayData.nutrients.carbs.amount - deletedMealData.carbs)
      },
      fat: {
        ...dayData.nutrients.fat,
        amount: Math.max(0, dayData.nutrients.fat.amount - deletedMealData.fat)
      }
    };
    
    setDayData({
      ...dayData,
      meals: updatedMealGroups,
      nutrients: updatedNutrients
    });
    
    toast({
      title: "הארוחה נמחקה בהצלחה",
      description: "הערכים התזונתיים עודכנו בהתאם",
    });
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
                onClick={() => signOut()}
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
