
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
      <div className="space-y-6">
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {data.map((entry, index) => (
            <div 
              key={`stat-${index}`} 
              className="bg-gray-50 rounded-xl p-3 text-center"
              style={{ borderColor: entry.color, borderWidth: '2px' }}
            >
              <div className="text-sm text-gray-600">{entry.name}</div>
              <div className="font-bold mt-1" style={{ color: entry.color }}>
                {entry.value}g
              </div>
              <div className="text-xs mt-1" style={{ color: entry.color }}>
                {entry.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutrientChart;
