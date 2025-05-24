
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
  valueLabel: string;
  colorClass?: string;
}

const ProgressBar = ({ current, max, label, valueLabel, colorClass }: ProgressBarProps) => {
  const percentage = Math.round((current / max) * 100);
  const displayWidth = Math.min(percentage, 100); // Cap visual width at 100%
  const isOverLimit = percentage > 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-semibold text-right">{label}</span>
        <span className="text-muted-foreground text-left">{valueLabel}</span>
      </div>
      <div className="h-6 bg-muted rounded-full relative overflow-hidden">
        <div 
          className={cn("progress-value", colorClass)} 
          style={{ width: `${displayWidth}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-foreground">
            {percentage}% {isOverLimit && <span className="ml-1">↑</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
