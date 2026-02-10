import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/app/components/WelcomeScreen";
import { AuthDialog } from "@/app/components/AuthDialog";
import { Homepage } from "@/app/components/Homepage";
import { ProductsScreen } from "@/app/components/ProductsScreen";
import { ProductLocator } from "@/app/components/ProductLocator";
import { EducationScreen } from "@/app/components/EducationScreen";
import { CommunityScreen } from "@/app/components/CommunityScreen";
import { AskExpertScreen } from "@/app/components/AskExpertScreen";
import { PeriodTracker } from "@/app/components/PeriodTracker";
import { HealthTipsScreen } from "@/app/components/HealthTipsScreen";
import { FeedbackScreen } from "@/app/components/FeedbackScreen";
import { SettingsScreen } from "@/app/components/SettingsScreen";
import { ResetPasswordScreen } from "@/app/components/ResetPasswordScreen";
import { Toaster } from "@/app/components/ui/sonner";
import { getSupabaseClient } from "@/utils/supabase/client";

type Screen = "welcome" | "home" | "products" | "locator" | "education" | "community" | "ask-expert" | "tracker" | "health-tips" | "feedback" | "settings" | "reset-password";
type AuthMode = "signup" | "login" | "reset";

export default function App() {
    const SCREEN_KEY = "ejama_current_screen";

  const saveScreen = (screen: Screen) => {
    localStorage.setItem(SCREEN_KEY, screen);
  };

  const loadSavedScreen = (): Screen | null => {
    return (localStorage.getItem(SCREEN_KEY) as Screen | null);
  };

  const allowedScreens: Screen[] = [
    "home",
    "products",
    "locator",
    "education",
    "community",
    "ask-expert",
    "tracker",
    "health-tips",
    "feedback",
    "settings",
  ];

  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState("");


  useEffect(() => {
    checkSession();
  }, []);

 useEffect(() => {
  const handleBeforeUnload = async () => {
        if (sessionStorage.getItem("ejama_temp_session") === "1") {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();

      sessionStorage.removeItem("ejama_temp_session");
      localStorage.removeItem(SCREEN_KEY);
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, []);
   

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        setAccessToken(session.access_token);
        setIsAuthenticated(true);

       const user = session.user;

const name =
  user.user_metadata?.name ||
  user.user_metadata?.full_name ||
  user.email ||
  "there";

const avatar =
  user.user_metadata?.profile_picture ||
  user.user_metadata?.avatar_url ||
  user.user_metadata?.picture ||
  "";

setUserName(name);
setUserAvatar(avatar);

const saved = loadSavedScreen();
setCurrentScreen(saved && allowedScreens.includes(saved) ? saved : "home");


      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  const handleSignUpClick = () => {
    setAuthMode("signup");
    setAuthDialogOpen(true);
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setAuthDialogOpen(true);
  };

  const handleForgotPasswordClick = () => {
    setAuthDialogOpen(false);
    setCurrentScreen("reset-password");
  };

  const handleAuthSuccess = async (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
      const name =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email;

      const avatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        "";

      setUserName(name);
      setUserAvatar(avatar); // 👈 ADD THIS
    }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("there");
    }
    
   const saved = loadSavedScreen();
setCurrentScreen(saved && allowedScreens.includes(saved) ? saved : "home");
    setAuthDialogOpen(false);
  };

  const handleLogout = async () => {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();

  localStorage.removeItem(SCREEN_KEY);

  setAccessToken("");
  setIsAuthenticated(false);
  setUserName("");
  setUserAvatar("");
  setCurrentScreen("welcome");
};
  
    const handleNavigate = (screen: string) => {
    const next = screen as Screen;
    setCurrentScreen(next);
    saveScreen(next);
  };

    const handleBack = () => {
    setCurrentScreen("home");
    saveScreen("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen
            onSignUp={handleSignUpClick}
            onLogin={handleLoginClick}
          />
        );
      case "home":
        return <Homepage onNavigate={handleNavigate} userName={userName} onLogout={handleLogout} />;

      case "products":
        return <ProductsScreen onBack={handleBack} onNavigateToLocator={() => handleNavigate("locator")} />;
      case "locator":
        return <ProductLocator onBack={handleBack} />;
      case "education":
        return <EducationScreen onBack={handleBack} accessToken={accessToken} />;
      case "community":
        return <CommunityScreen onBack={handleBack} accessToken={accessToken} />;
      case "ask-expert":
        return <AskExpertScreen onBack={handleBack} accessToken={accessToken} />;
      case "tracker":
        return <PeriodTracker onBack={handleBack} accessToken={accessToken} />;
      case "health-tips":
        return <HealthTipsScreen onBack={handleBack} accessToken={accessToken} />;
      case "feedback":
        return <FeedbackScreen onBack={handleBack} />;
      case "settings":
        return <SettingsScreen onBack={handleBack} onLogout={handleLogout} accessToken={accessToken} userName={userName} userAvatar={userAvatar}/>;
      case "reset-password":
        return (
          <ResetPasswordScreen
            onDone={() => {
              setCurrentScreen("welcome");
              setAuthMode("login");
              setAuthDialogOpen(true);
            }}
          />
        );
      default:
        return <Homepage onNavigate={handleNavigate} userName={userName} onLogout={handleLogout} />;

    }
  };

  return (
    <>
      {renderScreen()}
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onForgotPassword={handleForgotPasswordClick}
      />
      <Toaster />
    </>
  );
}
