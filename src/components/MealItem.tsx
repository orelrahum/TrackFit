
import { Meal } from "@/types";

interface MealItemProps {
  meal: Meal;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MealItem = ({ meal, onEdit, onDelete }: MealItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b hover:bg-muted">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="flex items-center">
          <div>
            <h3 className="font-medium text-sm">
              {meal.name}
              {(meal.weight || meal.unit) && (
                <span className="text-muted-foreground text-xs mr-1">
                  {meal.weight && `(${meal.weight}${meal.unit ? ' ' + meal.unit : 'g'})`}
                  {!meal.weight && meal.unit && `(${meal.unit})`}
                </span>
              )}
            </h3>
          </div>
          <div className="flex mr-2">
            <button 
              onClick={() => onEdit(meal.id)} 
              className="p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950 rounded-full"
              aria-label="ערוך ארוחה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button 
              onClick={() => onDelete(meal.id)} 
              className="p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950 rounded-full"
              aria-label="מחק ארוחה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-2 sm:mt-0 flex-row-reverse">
        <span className="text-sm text-foreground">{meal.calories} קק"ל</span>
        <div className="flex gap-3">
          <span className="text-xs text-muted-foreground/75">חלבון {meal.protein}g</span>
          <span className="text-xs text-muted-foreground/75">פחמימות {meal.carbs}g</span>
          <span className="text-xs text-muted-foreground/75">שומן {meal.fat}g</span>
        </div>
      </div>
    </div>
  );
};

export default MealItem;
