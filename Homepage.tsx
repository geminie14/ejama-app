import { Card } from "@/app/components/ui/card";
import { Package, MapPin, BookOpen, Users, Calendar, Heart, MessageSquare, Settings, HelpCircle, LogOut } from "lucide-react";
import logoImage from "@/assets/ce6a3ec9562f1270d6bfa0cc1141d0e067c0c231.png";
import { Button } from "@/app/components/ui/button";

interface HomepageProps {
  onNavigate: (screen: string) => void;
  userName: string;
  onLogout: () => void;
}


export function Homepage({ onNavigate, userName, onLogout }: HomepageProps) {
  const menuItems = [
    { icon: Package, label: "Products", screen: "products", color: "bg-[#BCA4E3] text-[#594F62]" },
    { icon: MapPin, label: "Product Locator", screen: "locator", color: "bg-[#B9A5E2] text-[#594F62]" },
    { icon: BookOpen, label: "Education", screen: "education", color: "bg-[#D4C4EC] text-[#594F62]" },
    { icon: Users, label: "Community", screen: "community", color: "bg-[#D1C1F2] text-[#594F62]" },
    { icon: HelpCircle, label: "Ask the Expert", screen: "ask-expert", color: "bg-[#C9B8E6] text-[#594F62]" },
    { icon: Calendar, label: "Period Tracker", screen: "tracker", color: "bg-[#9279BA] text-white" },
    { icon: Heart, label: "Health Tips", screen: "health-tips", color: "bg-[#B2A0B9] text-white" },
    { icon: MessageSquare, label: "Feedback", screen: "feedback", color: "bg-[#A592AB] text-white" },
    { icon: Settings, label: "Settings", screen: "settings", color: "bg-[#745E96] text-white" },
  ];

  return (
    <div className="min-h-screen bg-[#E7DDFF] p-4">
      <div className="max-w-6xl mx-auto">
        <header className="relative text-center py-8">
          <div className="absolute right-0 top-0">
  <Button variant="outline" onClick={onLogout} className="gap-2">
    <LogOut className="w-4 h-4" />
    Logout
  </Button>
</div>
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="Ejama Logo" className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#594F62' }}>Ejama</h1>
          <p style={{ color: '#776B7D' }}>Empowering Menstrual Health</p>
        </header>

        <div className="mb-6">
  <h2 className="text-lg font-semibold" style={{ color: "#594F62" }}>
    Hi, {userName} 👋
  </h2>
  <p className="text-sm" style={{ color: "#776B7D" }}>
    What would you like to explore today?
  </p>
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {menuItems.map((item) => (
            <Card
              key={item.screen}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => onNavigate(item.screen)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-4 rounded-full ${item.color}`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold" style={{ color: '#594F62' }}>{item.label}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
