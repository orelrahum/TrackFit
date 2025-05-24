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
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Update document title when date changes
  useEffect(() => {
    if (location.pathname === "/") {
      document.title = `TrackFit - ${currentDate.toISOString().split('T')[0]}`;
    }
  }, [currentDate, location.pathname]);

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  // Only show date navigation on homepage
  const showDateNav = location.pathname === "/";

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
        navigate("/auth/login", { replace: true });
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
    <header className="bg-background shadow-sm py-4 mb-6 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left: Empty space or Date Navigation */}
          <div className="w-[400px] flex items-center">
            {showDateNav && (
              <DateNavigation 
                currentDate={currentDate} 
                onPrevDay={handlePrevDay} 
                onNextDay={handleNextDay}
                onTodayClick={handleTodayClick}
              />
            )}
          </div>

          {/* Center: Logos - Always centered */}
          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center">
              <img src={LogoText} alt="TrackFit Logo" className="h-8" />
              <img src={SymbolLogo} alt="TrackFit Symbol" className="h-8 mr-2" />
            </div>
          </div>

          {/* Right: Theme Toggle and Sign Out Buttons */}
          <div className="w-[400px] flex items-center gap-4 justify-end">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              התנתק
            </button>
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
