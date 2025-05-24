
import { CircleChevronLeft, CircleChevronRight, Calendar } from "lucide-react";

interface DateNavigationProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onTodayClick: () => void;
}

const DateNavigation = ({ currentDate, onPrevDay, onNextDay, onTodayClick }: DateNavigationProps) => {
  // Hebrew options for date formatting
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const getDisplayDate = (date: Date) => {
    // Get current date at midnight in local timezone
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Convert input date to local midnight
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (compareDate.getTime() === today.getTime()) {
      return "היום";
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return "מחר";
    } else if (compareDate.getTime() === yesterday.getTime()) {
      return "אתמול";
    } else {
      return new Intl.DateTimeFormat('he-IL', options).format(date);
    }
  };

  const displayDate = getDisplayDate(currentDate);
  
  return (
    <div className="flex items-center justify-between w-[400px] px-4 py-2">
      <button 
        onClick={onPrevDay}
        className="p-1 rounded-full hover:bg-gray-100"
        aria-label="היום הקודם"
      >
        <CircleChevronRight className="h-6 w-6" />
      </button>
      
      <div className="flex items-center gap-2 min-w-[280px] justify-center">
        <h2 className="text-lg font-bold whitespace-nowrap">{displayDate}</h2>
        <button
          onClick={onTodayClick}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="חזור להיום"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>
      
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
