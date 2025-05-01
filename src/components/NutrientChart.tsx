
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface NutrientChartProps {
  protein: number;
  carbs: number; 
  fat: number;
}

const NutrientChart = ({ protein, carbs, fat }: NutrientChartProps) => {
  const total = protein + carbs + fat;
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] bg-white rounded-lg shadow-sm">
        <div className="text-gray-500 text-center">אין נתונים להצגה</div>
      </div>
    );
  }
  
  const proteinPercent = Math.round((protein / total) * 100);
  const carbsPercent = Math.round((carbs / total) * 100);
  const fatPercent = Math.round((fat / total) * 100);

  const data: ChartData[] = [
    { name: "חלבון", value: protein, color: "#50C878", percentage: proteinPercent },
    { name: "פחמימות", value: carbs, color: "#3b82f6", percentage: carbsPercent },
    { name: "שומן", value: fat, color: "#FFD700", percentage: fatPercent }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">התפלגות אבות המזון</h2>
      <div className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-semibold text-gray-700">סה"כ</div>
            <div className="text-xl font-bold">{total}g</div>
          </div>
        </div>

        {/* Custom Labels */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full relative">
            {/* Protein Label - Top */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center bg-white/80 px-3 py-1 rounded-full shadow-sm">
              <div className="font-bold text-[#50C878] flex items-center justify-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#50C878] inline-block"></span>
                <span>חלבון {proteinPercent}%</span>
              </div>
            </div>
            
            {/* Carbs Label - Bottom Left */}
            <div className="absolute bottom-2 left-4 text-center bg-white/80 px-3 py-1 rounded-full shadow-sm">
              <div className="font-bold text-[#3b82f6] flex items-center justify-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6] inline-block"></span>
                <span>פחמימות {carbsPercent}%</span>
              </div>
            </div>
            
            {/* Fat Label - Bottom Right */}
            <div className="absolute bottom-2 right-4 text-center bg-white/80 px-3 py-1 rounded-full shadow-sm">
              <div className="font-bold text-[#FFD700] flex items-center justify-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#FFD700] inline-block"></span>
                <span>שומן {fatPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutrientChart;
