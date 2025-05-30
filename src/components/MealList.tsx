
import { useState } from "react";
import { MealGroup, Meal } from "@/types";
import MealItem from "./MealItem";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  onDeleteGroup?: (groupId: string) => void;
  onAddFoodToGroup?: (groupId: string) => void;
}

const MealList = ({ meals, onAddMeal, onAddWithAI, onEditMeal, onDeleteMeal, onEditGroup, onDeleteGroup, onAddFoodToGroup }: MealListProps) => {
  const [editingGroup, setEditingGroup] = useState<MealGroup | null>(null);
  const [editedGroupName, setEditedGroupName] = useState("");
  const [groupToDelete, setGroupToDelete] = useState<MealGroup | null>(null);
  return (
    <div className="bg-card rounded-lg h-full flex flex-col overflow-hidden">
      <div className="p-2 md:p-3 border-b flex-none">
        <h2 className="text-base md:text-lg font-semibold">הארוחות שלי</h2>
      </div>
      
      <div className="overflow-y-auto flex-1 min-h-0">
        {meals.length > 0 ? (
          meals.map((mealGroup) => (
            <div key={mealGroup.id} className="mb-4">
              <div className="p-2 md:p-3 bg-muted border-b flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center">
                  <h3 className="font-medium text-base md:text-lg">{mealGroup.name}</h3>
                  <div className="flex mr-2">
                    {onAddFoodToGroup && (
                      <button
                        onClick={() => onAddFoodToGroup(mealGroup.id)}
                        className="p-2 md:p-1.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950 rounded-full"
                        aria-label="הוסף מאכל לארוחה"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                    {onEditGroup && (
                      <button
                        onClick={() => {
                          setEditingGroup(mealGroup);
                          setEditedGroupName(mealGroup.name);
                        }}
                        className="p-2 md:p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950 rounded-full"
                        aria-label="ערוך שם קבוצה"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDeleteGroup && (
                      <button
                        onClick={() => setGroupToDelete(mealGroup)}
                        className="p-2 md:p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950 rounded-full"
                        aria-label="מחק קבוצה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-2 sm:mt-0 flex-row-reverse">
                  <span className="text-base font-medium text-foreground">{Math.round(mealGroup.meals.reduce((sum, meal) => sum + meal.calories, 0))} קק"ל</span>
                  <div className="flex gap-4">
                    <span className="text-xs text-muted-foreground">חלבון {Math.round(mealGroup.meals.reduce((sum, meal) => sum + meal.protein, 0))}g</span>
                    <span className="text-xs text-muted-foreground">פחמימות {Math.round(mealGroup.meals.reduce((sum, meal) => sum + meal.carbs, 0))}g</span>
                    <span className="text-xs text-muted-foreground">שומן {Math.round(mealGroup.meals.reduce((sum, meal) => sum + meal.fat, 0))}g</span>
                  </div>
                </div>
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
      
      <div className="p-2 md:p-3 flex justify-between border-t bg-card flex-none">
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

      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את הקבוצה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הקבוצה "{groupToDelete?.name}" וכל הארוחות שבה. פעולה זו היא בלתי הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (groupToDelete && onDeleteGroup) {
                  onDeleteGroup(groupToDelete.id);
                  setGroupToDelete(null);
                }
              }}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MealList;
