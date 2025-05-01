
import { Meal } from "@/types";

interface MealItemProps {
  meal: Meal;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MealItem = ({ meal, onEdit, onDelete }: MealItemProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b border-gray-100 hover:bg-gray-50">
      <div className="flex items-center space-x-3 space-x-reverse mb-2 sm:mb-0">
        {meal.image && (
          <img 
            src={meal.image} 
            alt={meal.name} 
            className="w-12 h-12 object-cover rounded-full"
          />
        )}
        <div className="mr-3">
          <h3 className="font-medium">
            {meal.name}
            {(meal.weight || meal.unit) && (
              <span className="text-gray-500 text-sm mr-1">
                {meal.weight && `(${meal.weight}${meal.unit ? ' ' + meal.unit : 'g'})`}
                {!meal.weight && meal.unit && `(${meal.unit})`}
              </span>
            )}
          </h3>
        </div>
      </div>
      
      <div className="flex justify-between sm:justify-end w-full sm:w-auto">
        <div className="text-left">
          <div className="font-semibold">{meal.calories} קק"ל</div>
          <div className="grid grid-cols-3 gap-x-3 text-xs text-gray-500 sm:flex sm:text-sm sm:space-x-2 sm:space-x-reverse">
            <span>חלבון {meal.protein}g</span>
            <span>פחמימות {meal.carbs}g</span>
            <span>שומן {meal.fat}g</span>
          </div>
        </div>
        
        <div className="flex ml-2 sm:ml-4">
          <button 
            onClick={() => onEdit(meal.id)} 
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
            aria-label="ערוך ארוחה"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button 
            onClick={() => onDelete(meal.id)} 
            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
            aria-label="מחק ארוחה"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealItem;
