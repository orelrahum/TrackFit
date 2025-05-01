
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import DateNavigation from "@/components/DateNavigation";
import DailySummary from "@/components/DailySummary";
import NutrientChart from "@/components/NutrientChart";
import MealList from "@/components/MealList";
import { mockData } from "@/data/mockData";
import { DayData, MealGroup, Meal } from "@/types";

const HomePage = () => {
  const { toast } = useToast();
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

  const handleAddMeal = () => {
    toast({
      title: "פתיחת טופס הוספת ארוחה",
      description: "בגרסה מלאה של האפליקציה, כאן ייפתח טופס להוספת ארוחה חדשה",
    });
  };

  const handleAddWithAI = () => {
    toast({
      title: "פתיחת הוספה עם AI",
      description: "בגרסה מלאה של האפליקציה, כאן תופעל פונקציית הוספה עם AI",
    });
  };

  const handleEditMeal = (id: string) => {
    toast({
      title: "עריכת ארוחה",
      description: `בגרסה מלאה של האפליקציה, כאן ייפתח טופס לעריכת ארוחה מספר ${id}`,
    });
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
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white shadow-sm py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-blue-600">TrackFit</div>
            <div className="text-sm text-gray-600">מעקב תזונה יומי</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <DateNavigation 
          currentDate={currentDate} 
          onPrevDay={handlePrevDay} 
          onNextDay={handleNextDay} 
        />
        
        {/* תצוגה למסכים גדולים */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <DailySummary nutrients={dayData.nutrients} />
            <MealList 
              meals={dayData.meals}
              onAddMeal={handleAddMeal}
              onAddWithAI={handleAddWithAI}
              onEditMeal={handleEditMeal}
              onDeleteMeal={handleDeleteMeal}
            />
          </div>
          <div className="md:col-span-4">
            <NutrientChart 
              protein={dayData.nutrients.protein.amount} 
              carbs={dayData.nutrients.carbs.amount} 
              fat={dayData.nutrients.fat.amount} 
            />
          </div>
        </div>
        
        {/* תצוגה למסכים קטנים */}
        <div className="md:hidden space-y-6">
          <DailySummary nutrients={dayData.nutrients} />
          <NutrientChart 
            protein={dayData.nutrients.protein.amount} 
            carbs={dayData.nutrients.carbs.amount} 
            fat={dayData.nutrients.fat.amount} 
          />
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
  );
};

export default HomePage;
