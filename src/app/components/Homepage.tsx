// src/app/components/Homepage.tsx
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  Package,
  MapPin,
  BookOpen,
  Users,
  HelpCircle,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

type Screen =
  | "welcome"
  | "home"
  | "products"
  | "locator"
  | "education"
  | "community"
  | "ask-expert"
  | "tracker"
  | "health-tips"
  | "feedback"
  | "settings"
  | "reset-password";

type HomepageProps = {
  onNavigate: (screen: Screen) => void;
  userName: string;
  userAvatar?: string;
  onLogout: () => void | Promise<void>;
};

function Tile({
  title,
  subtitle,
  icon,
  onClick,
  variant = "default",
  disabled = false,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "secondary";
  disabled?: boolean;
  badge?: string;
}) {
  const base =
    "group w-full text-left rounded-2xl border bg-white shadow-sm transition active:scale-[0.99]";

  const primary =
    "border-transparent bg-gradient-to-br from-[#7C3AED] to-[#A592AB] text-white";
  const secondary = "border-[#E7DDFF] bg-white";

  const disabledClass = "opacity-70 cursor-not-allowed hover:shadow-sm";
  const enabledClass = "hover:shadow-md";

  const cardClassRaw =
    variant === "primary"
      ? `${base} ${primary}`
      : variant === "secondary"
      ? `${base} ${secondary}`
      : base;

  const cardClass = `${cardClassRaw} ${disabled ? disabledClass : enabledClass}`;

  const titleClass =
    variant === "primary"
      ? "text-lg font-semibold text-white"
      : "text-base font-semibold text-[#594F62]";

  const subtitleClass =
    variant === "primary" ? "text-sm text-white/80" : "text-sm text-[#776B7D]";

  const iconWrap =
    variant === "primary"
      ? "h-12 w-12 rounded-full bg-white/20 flex items-center justify-center"
      : "h-12 w-12 rounded-full bg-[#EDE7FF] flex items-center justify-center";

  const iconColor = variant === "primary" ? "text-white" : "text-[#594F62]";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={cardClass}
      type="button"
      disabled={disabled}
    >
      <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={iconWrap}>
            <div className={iconColor}>{icon}</div>
          </div>

          <div className="min-w-0">
            <div className={titleClass}>{title}</div>
            {subtitle ? <div className={subtitleClass}>{subtitle}</div> : null}
          </div>
        </div>

        {badge ? (
          <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-[#EDE7FF] text-[#594F62] border border-[#D4C4EC]">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}


export function Homepage({ onNavigate, userName, userAvatar, onLogout }: HomepageProps) {
  return (
    <div className="min-h-screen bg-[#E7DDFF]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-[#594F62]">
              Ejama
            </div>
            <div className="text-sm sm:text-base text-[#776B7D] mt-1">
              Empowering Menstrual Health
            </div>

            <div className="mt-4">
              <div className="text-lg sm:text-xl font-semibold text-[#594F62]">
                Hi, {userName?.split(" ")[0] || "there"} <span className="ml-1">👋</span>
              </div>
              <div className="text-sm text-[#776B7D]">
                What would you like to explore today?
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("settings")}
            className="h-11 w-11 rounded-full overflow-hidden border border-[#D4C4EC] bg-white flex items-center justify-center shadow-sm hover:shadow-md transition"
            aria-label="Open settings"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-[#594F62]">
                {userName?.trim()?.slice(0, 1)?.toUpperCase() || "U"}
              </span>
            )}
          </button>

        </div>

        {/* Primary Actions (BIG) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Tile
            variant="primary"
            title="Find Products Near You"
            subtitle="Locate pads, tampons & essentials"
            icon={<MapPin className="w-6 h-6" />}
            onClick={() => onNavigate("locator")}
          />
          <Tile
  title="Browse Products"
  subtitle="Explore trusted options"
  icon={<Package className="w-6 h-6" />}
  onClick={() => onNavigate("products")}
  disabled
  badge="Coming soon"
/>

          <Tile
  variant="secondary"
  title="Learn"
  subtitle="Guides & resources"
  icon={<BookOpen className="w-6 h-6" />}
  onClick={() => onNavigate("education")}
/>

        </div>

        {/* Secondary Actions (normal grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 
  <Tile
  title="Community"
  subtitle="Connect & share"
  icon={<Users className="w-6 h-6" />}
  onClick={() => onNavigate("community")}
  disabled
  badge="Coming soon"
/>

<Tile
  title="Ask an Expert"
  subtitle="Get answers privately"
  icon={<HelpCircle className="w-6 h-6" />}
  onClick={() => onNavigate("ask-expert")}
  disabled
  badge="Coming soon"
/>

<Tile
  title="Track Period"
  subtitle="Stay on top of your cycle"
  icon={<Calendar className="w-6 h-6" />}
  onClick={() => onNavigate("tracker")}
  disabled
  badge="Coming soon"
/>

<Tile
  title="Wellness Tips"
  subtitle="Healthy habits & support"
  icon={<Heart className="w-6 h-6" />}
  onClick={() => onNavigate("health-tips")}
  disabled
  badge="Coming soon"
/>

           <Tile
    title="Share Feedback"
    subtitle="Help us improve"
    icon={<MessageSquare className="w-6 h-6" />}
    onClick={() => onNavigate("feedback")}
  />

  <Tile
    title="Settings"
    subtitle="Account & preferences"
    icon={<Settings className="w-6 h-6" />}
    onClick={() => onNavigate("settings")}
  />
</div>


                <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-xl border-[#D4C4EC] bg-white text-[#594F62] hover:bg-[#F6F2FF]"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Footer */}
        <Card className="mt-6 p-4 rounded-2xl border-[#B2A0B9] bg-[#D4C4EC]">
          <p className="text-sm text-center text-[#594F62]">
            Ejama v1.0 • Made with 💜 for women&apos;s health
          </p>
        </Card>
      </div>
    </div>
  );
}

