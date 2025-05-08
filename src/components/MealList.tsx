
import { useState } from "react";
import { MealGroup, Meal } from "@/types";
import MealItem from "./MealItem";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MealListProps {
  meals: MealGroup[];
  onAddMeal: () => void;
  onAddWithAI: () => void;
  onEditMeal: (id: string) => void;
  onDeleteMeal: (id: string) => void;
  onEditGroup?: (groupId: string, data: { name: string }) => void;
}

const MealList = ({ meals, onAddMeal, onAddWithAI, onEditMeal, onDeleteMeal, onEditGroup }: MealListProps) => {
  const [editingGroup, setEditingGroup] = useState<MealGroup | null>(null);
  const [editedGroupName, setEditedGroupName] = useState("");
  return (
    <div className="bg-card rounded-lg h-full flex flex-col">
      <div className="p-4 border-b flex-none">
        <h2 className="text-lg font-semibold">הארוחות שלי</h2>
      </div>
      
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 14rem)" }}>
        {meals.length > 0 ? (
          meals.map((mealGroup) => (
            <div key={mealGroup.id} className="mb-4">
              <div className="p-3 bg-muted border-b flex justify-between items-center">
                <h3 className="font-medium text-foreground">{mealGroup.name}</h3>
                {onEditGroup && (
                  <button
                    onClick={() => {
                      setEditingGroup(mealGroup);
                      setEditedGroupName(mealGroup.name);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950 rounded-full"
                    aria-label="ערוך שם קבוצה"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
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
      
      <div className="p-4 flex justify-between border-t bg-card sticky bottom-0">
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

      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>עריכת שם קבוצה</DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingGroup && onEditGroup) {
              onEditGroup(editingGroup.id, { name: editedGroupName });
              setEditingGroup(null);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">שם הקבוצה</Label>
              <Input
                id="groupName"
                value={editedGroupName}
                onChange={(e) => setEditedGroupName(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                ביטול
              </Button>
              <Button type="submit">
                שמור שינויים
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealList;
