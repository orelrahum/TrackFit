import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import DateNavigation from "@/components/DateNavigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LogoText from '/Logo/LogoText.png';
import SymbolLogo from '/Logo/Symbol.png';

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Initialize with current date in local timezone
    const now = new Date();
    // Convert to local midnight
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return local;
  });

  // Set initial title and trigger meal load when component mounts
  useEffect(() => {
    if (location.pathname === "/home") {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      document.title = `TrackFit - ${dateStr}`;
    }
  }, [location.pathname, currentDate]);

  const updateDateAndTitle = (newDate: Date) => {
    if (location.pathname === "/home") {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      document.title = `TrackFit - ${dateStr}`;
    }
    setCurrentDate(newDate);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 1
    );
    updateDateAndTitle(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1
    );
    updateDateAndTitle(nextDay);
  };

  const handleTodayClick = () => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    updateDateAndTitle(today);
  };

  // Only show date navigation on homepage for authenticated users
  const showDateNav = location.pathname === "/home" && user;

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "שגיאה בהתנתקות",
          description: error.message,
          variant: "destructive",
        });
      } else {
        navigate("/welcome", { replace: true });
      }
    } catch (err) {
      toast({
        title: "שגיאה בהתנתקות",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background shadow-sm py-2 md:py-4 mb-4 md:mb-6 sticky top-0 z-50">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex justify-between items-center">
          {/* Left: Date Navigation - Hidden on mobile */}
          <div className="hidden md:flex md:w-[400px] items-center">
            {showDateNav && (
              <DateNavigation 
                currentDate={currentDate} 
                onPrevDay={handlePrevDay} 
                onNextDay={handleNextDay}
                onTodayClick={handleTodayClick}
              />
            )}
          </div>

          {/* Center: Logos - Responsive */}
          <div className="flex-1 flex justify-center items-center">
            <button 
              onClick={() => navigate(user ? '/home' : '/welcome')} 
              className="flex items-center hover:opacity-80 transition-all rounded-lg hover:bg-accent/10 p-1 md:p-2"
            >
              <img src={SymbolLogo} alt="TrackFit Symbol" className="h-7 md:h-8" />
              <img src={LogoText} alt="TrackFit Logo" className="hidden md:block h-7 md:h-8 md:mr-2" />
            </button>
          </div>

          {/* Right: Theme Toggle and Sign Out Buttons - Responsive */}
          <div className="flex items-center gap-2 md:gap-4 justify-end md:w-[400px]">
            <ThemeToggle />
            {user && (
              <button
                onClick={handleSignOut}
                className="px-2 md:px-3 py-1 text-xs md:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                התנתק
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 ml-2" />
      ) : (
        <Moon className="h-5 w-5 ml-2" />
      )}
    </Button>
  );
};

export default Header;
