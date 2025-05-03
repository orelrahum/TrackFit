import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import LogoText from '/Logo/LogoText.png';
import SymbolLogo from '/Logo/Symbol.png';

const Header = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
          {/* Logos Centered */}
          <div className="flex-1 flex justify-center items-center">
            <img src={LogoText} alt="TrackFit Logo" className="h-8" />
            <img src={SymbolLogo} alt="TrackFit Symbol" className="h-8 mr-2" />
          </div>

          {/* Theme Toggle and Sign Out Buttons */}
          <div className="flex items-center gap-4">
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
