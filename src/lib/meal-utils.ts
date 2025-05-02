import { MealGroup } from "@/types";

/**
 * Calculates total nutrients from meal groups
 */
export function calculateTotalNutrients(mealGroups: MealGroup[]) {
  return mealGroups.reduce((totals, group) => {
    return group.meals.reduce((groupTotals, meal) => {
      return {
        calories: groupTotals.calories + (meal.calories || 0),
        protein: groupTotals.protein + (meal.protein || 0),
        carbs: groupTotals.carbs + (meal.carbs || 0),
        fat: groupTotals.fat + (meal.fat || 0),
      };
    }, totals);
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
