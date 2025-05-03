
import { useState } from "react";
import { MealGroup, Meal } from "@/types";
import MealItem from "./MealItem";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealListProps {
  meals: MealGroup[];
  onAddMeal: () => void;
  onAddWithAI: () => void;
  onEditMeal: (id: string) => void;
  onDeleteMeal: (id: string) => void;
}

const MealList = ({ meals, onAddMeal, onAddWithAI, onEditMeal, onDeleteMeal }: MealListProps) => {
  return (
    <div className="bg-card rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">הארוחות שלי</h2>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {meals.length > 0 ? (
          meals.map((mealGroup) => (
            <div key={mealGroup.id} className="mb-4">
              <div className="p-3 bg-muted border-b">
                <h3 className="font-medium text-foreground">{mealGroup.name}</h3>
              </div>
              {mealGroup.meals.map((meal) => (
                <MealItem 
                  key={meal.id} 
                  meal={meal}
                  onEdit={onEditMeal}
                  onDelete={onDeleteMeal}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>אין ארוחות מתועדות להיום</p>
          </div>
        )}
      </div>
      
      <div className="p-4 flex justify-between border-t">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onAddWithAI}
        >
          <span className="ml-1">הוסף עם AI</span>
        </Button>
        
        <Button
          className="flex items-center bg-red-600 hover:bg-red-700 text-white" // Changed background to red and ensured text is white
          onClick={onAddMeal}
        >
          <Plus className="h-4 w-4 ml-1" />
          <span>הוסף ארוחה</span>
        </Button>
      </div>
    </div>
  );
};

export default MealList;
