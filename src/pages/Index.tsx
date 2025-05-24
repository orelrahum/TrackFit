import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // No auto-redirect for authenticated users, instead show a button to go to home

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20" dir="rtl">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <img src="/Logo/LogoText.png" alt="TrackFit Logo" className="h-20 mb-4" />
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight">
              מעקב קלוריות ושתייה בקלות
            </h1>
            <p className="text-xl text-muted-foreground">
              הדרך הפשוטה לעקוב אחר התזונה והשתייה היומית שלך
            </p>
          </div>

          {user ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/home')}
              className="text-lg px-8"
            >
              עבור לדף הבית
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => navigate('/auth/login')}
              className="text-lg px-8"
            >
              התחל עכשיו
            </Button>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">מעקב קלוריות</h3>
            <p className="text-muted-foreground">
              עקוב אחר צריכת הקלוריות היומית שלך בקלות ובמהירות
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">מעקב שתייה</h3>
            <p className="text-muted-foreground">
              שמור על כמות השתייה היומית המומלצת עם מעקב פשוט ונוח
            </p>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">סטטיסטיקות</h3>
            <p className="text-muted-foreground">
              צפה בנתונים והתקדמות שלך לאורך זמן
            </p>
          </Card>
        </div>

        {/* Bookmark Info */}
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            טיפ: סמן את <span className="font-medium">/home</span> כסימניה לגישה מהירה לדף הבית שלך
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
