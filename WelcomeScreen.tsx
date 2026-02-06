import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import logoImage from "@/asset/ce6a3ec9562f1270d6bfa0cc1141d0e067c0c231.png";

interface WelcomeScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onSignUp, onLogin }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-[#E7DDFF] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 space-y-6 bg-white/95 backdrop-blur-sm shadow-xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="Ejama Logo" className="w-32 h-32" />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: '#594F62' }}>Ejama</h1>
          <p className="leading-relaxed" style={{ color: '#776B7D' }}>
           Welcome to Ejama — your trusted space for menstrual health.

Discover nearby menstrual products, access reliable health information, and connect with a supportive community. Empowering health, knowledge, and confidence for women and girls, every day.

          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={onSignUp}
            className="w-full h-12 text-lg text-white"
            style={{ backgroundColor: '#A592AB' }}
          >
            Sign Up
          </Button>
          
          <Button 
            onClick={onLogin}
            variant="outline"
            className="w-full h-12 text-lg"
            style={{ borderColor: '#A592AB', color: '#A592AB' }}
          >
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
