
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  valueLabel: string;
  colorClass?: string;
}

const ProgressBar = ({ current, max, label, valueLabel, colorClass }: ProgressBarProps) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-semibold text-right">{label}</span>
        <span className="text-gray-600 text-left">{valueLabel}</span>
      </div>
      <div className="progress-bar">
        <div 
          className={cn("progress-value", colorClass)} 
          style={{ width: `${percentage}%` }}
        >
          <div className="progress-percentage">
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
