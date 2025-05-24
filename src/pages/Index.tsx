import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background" dir="rtl">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-24">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Large welcome text instead of duplicate logos */}
          <h2 className="text-3xl text-muted-foreground font-medium">
            ברוכים הבאים ל-TrackFit
          </h2>
          
          <div className="space-y-8 max-w-3xl relative">
            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              מעקב קלוריות ושתייה בקלות
            </h1>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              הדרך החכמה לעקוב אחר התזונה והשתייה היומית שלך
            </p>
          </div>

          <div className="pt-8 relative">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full"></div>
            {user ? (
              <Button
                size="lg"
                onClick={() => navigate('/home')}
                className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                עבור לדף הבית
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate('/auth/login')}
                className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                התחל עכשיו
              </Button>
            )}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
            <Card className="p-8 text-center border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
              <div className="h-16 w-16 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">🍎</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">מעקב קלוריות</h3>
              <p className="text-muted-foreground">
                עקוב אחר צריכת הקלוריות היומית שלך בקלות ובמהירות, עם חישוב אוטומטי וממשק ידידותי
              </p>
            </Card>

            <Card className="p-8 text-center border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
              <div className="h-16 w-16 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">💧</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">מעקב שתייה</h3>
              <p className="text-muted-foreground">
                שמור על כמות השתייה היומית המומלצת עם מעקב חכם ותזכורות מותאמות אישית
              </p>
            </Card>

            <Card className="p-8 text-center border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 duration-300">
              <div className="h-16 w-16 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">סטטיסטיקות</h3>
              <p className="text-muted-foreground">
                צפה בנתונים והתקדמות שלך לאורך זמן עם גרפים ודוחות מפורטים
              </p>
            </Card>
          </div>

          {/* Bookmark Info */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              טיפ: סמן את <span className="font-medium">/home</span> כסימניה לגישה מהירה לדף הבית שלך
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
