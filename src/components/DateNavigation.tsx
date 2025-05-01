
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

interface DateNavigationProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
}

const DateNavigation = ({ currentDate, onPrevDay, onNextDay }: DateNavigationProps) => {
  // Hebrew options for date formatting
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  
  // Format the date in Hebrew
  const formattedDate = new Intl.DateTimeFormat('he-IL', options).format(currentDate);
  
  return (
    <div className="flex items-center justify-between w-full px-4 py-2">
      <button 
        onClick={onPrevDay}
        className="p-1 rounded-full hover:bg-gray-100"
        aria-label="היום הקודם"
      >
        <CircleChevronRight className="h-6 w-6" />
      </button>
      
      <h2 className="text-xl font-bold">{formattedDate}</h2>
      
      <button 
        onClick={onNextDay}
        className="p-1 rounded-full hover:bg-gray-100"
        aria-label="היום הבא"
      >
        <CircleChevronLeft className="h-6 w-6" />
      </button>
    </div>
  );
};

export default DateNavigation;
