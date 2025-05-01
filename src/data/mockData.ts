
import { DayData } from "../types";

export const mockData: DayData = {
  date: "2025-04-30",
  nutrients: {
    calories: { amount: 453, target: 2726 },
    protein: { amount: 51, target: 204 },
    carbs: { amount: 44, target: 273 },
    fat: { amount: 6, target: 91 }
  },
  meals: [
    {
      id: "group1",
      name: "ארוחת בוקר",
      meals: [
        {
          id: "1",
          name: "חזה עוף",
          calories: 248,
          protein: 47,
          carbs: 0,
          fat: 5,
          image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=80"
        }
      ]
    },
    {
      id: "group2",
      name: "ארוחת צהריים",
      meals: [
        {
          id: "2",
          name: "אורז לבן מבושל",
          calories: 205,
          protein: 4,
          carbs: 44,
          fat: 0,
          image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=80"
        }
      ]
    }
  ]
};
