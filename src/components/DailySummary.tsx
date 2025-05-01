
import { Nutrients } from "@/types";
import ProgressBar from "./ProgressBar";

interface DailySummaryProps {
  nutrients: Nutrients;
}

const DailySummary = ({ nutrients }: DailySummaryProps) => {
  const { calories, protein, carbs, fat } = nutrients;
  
  return (
    <div className="p-4 bg-white rounded-lg mb-4">
      <ProgressBar 
        current={calories.amount}
        max={calories.target}
        label="קלוריות"
        valueLabel={`${calories.amount} / ${calories.target} קק"ל`}
        colorClass="bg-progress-calories"
      />
      
      <ProgressBar 
        current={protein.amount}
        max={protein.target}
        label="חלבון"
        valueLabel={`${protein.amount} / ${protein.target} גרם`}
        colorClass="bg-progress-protein"
      />
      
      <ProgressBar 
        current={carbs.amount}
        max={carbs.target}
        label="פחמימות"
        valueLabel={`${carbs.amount} / ${carbs.target} גרם`}
        colorClass="bg-progress-carbs"
      />
      
      <ProgressBar 
        current={fat.amount}
        max={fat.target}
        label="שומן"
        valueLabel={`${fat.amount} / ${fat.target} גרם`}
        colorClass="bg-progress-fat"
      />
    </div>
  );
};

export default DailySummary;
