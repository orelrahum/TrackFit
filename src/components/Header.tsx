import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import LogoText from '/Logo/LogoText.png'; // Assuming Logo is in public or accessible path
import SymbolLogo from '/Logo/Symbol.png'; // Assuming Logo is in public or accessible path

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
    <header className="bg-white shadow-sm py-4 mb-6 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logos Centered */}
          <div className="flex-1 flex justify-center items-center">
            <img src={LogoText} alt="TrackFit Logo" className="h-8" />
            <img src={SymbolLogo} alt="TrackFit Symbol" className="h-8 mr-2" />
          </div>

          {/* Sign Out Button */}
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium rounded-md hover:bg-red-50 transition-colors"
            >
              התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
