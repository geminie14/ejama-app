import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/app/components/WelcomeScreen";
import { AuthDialog } from "@/app/components/AuthDialog";
import { Homepage } from "@/app/components/Homepage";
import { ProductsScreen } from "@/app/components/ProductsScreen";
import { ProductLocator } from "@/app/components/ProductLocator";
import { EducationScreen } from "@/app/components/EducationScreen";
import { AskQuestionScreen } from "@/app/components/AskQuestionScreen";
import { CommunityScreen } from "@/app/components/CommunityScreen";
import { AskExpertScreen } from "@/app/components/AskExpertScreen";
import { PeriodTracker } from "@/app/components/PeriodTracker";
import { HealthTipsScreen } from "@/app/components/HealthTipsScreen";
import { FeedbackScreen } from "@/app/components/FeedbackScreen";
import { SettingsScreen } from "@/app/components/SettingsScreen";
import { ResetPasswordScreen } from "@/app/components/ResetPasswordScreen";
import { Toaster } from "@/app/components/ui/sonner";
import { AdminQuestionsScreen } from "@/app/components/AdminQuestionsScreen";
import { getSupabaseClient } from "@/utils/supabase/client";

type Screen =
  | "welcome"
  | "home"
  | "locator"
  | "products"
  | "education"
  | "community"
  | "ask-expert"
  | "tracker"
  | "health-tips"
  | "feedback"
  | "settings"
  | "reset-password"
  | "ask-question"
  | "admin-questions";

type AuthMode = "signup" | "login" | "reset";

export default function App() {
  const SCREEN_KEY = "ejama_current_screen";

  const allowedScreens: Screen[] = [
    "home",
    "locator",
    "products",
    "education",
    "community",
    "ask-expert",
    "tracker",
    "health-tips",
    "feedback",
    "settings",
    "ask-question",
    "admin-questions",
  ];

  const saveScreen = (screen: Screen) => localStorage.setItem(SCREEN_KEY, screen);
  const loadSavedScreen = (): Screen | null =>
    (localStorage.getItem(SCREEN_KEY) as Screen | null);

  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  // ✅ Keep session + token fresh (handles refresh tokens too)
  useEffect(() => {
    const supabase = getSupabaseClient();

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session?.access_token) {
        setAccessToken(session.access_token);
        setIsAuthenticated(true);

        const user = session.user;
        setUserEmail(user.email || "");

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
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setIsAuthenticated(true);

        const user = session.user;
        setUserEmail(user.email || "");

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
      } else {
        setAccessToken("");
        setIsAuthenticated(false);
        setUserName("");
        setUserAvatar("");
        setUserEmail("");
        setCurrentScreen("welcome");
        localStorage.removeItem(SCREEN_KEY);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Optional: sign out temp sessions on tab close
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
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

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

  // ✅ Called by AuthDialog after login/signup
  const handleAuthSuccess = async (token: string) => {
    setAccessToken(token);
    setIsAuthenticated(true);

    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser(token);
      const user = data?.user;

      if (user) {
        setUserEmail(user.email || "");

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
    setUserEmail("");
    setCurrentScreen("welcome");
  };

  const handleNavigate = (screen: Screen) => {
    if (!allowedScreens.includes(screen)) return;
    setCurrentScreen(screen);
    saveScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen("home");
    saveScreen("home");
  };

  // ✅ Small helper so we don't call protected screens without a token
  const requireToken = (component: React.ReactNode) => {
    if (!isAuthenticated || !accessToken) {
      // If user is logged in but token is still loading, avoid firing requests with Bearer ""
      return (
        <Homepage
          onNavigate={handleNavigate}
          userName={userName}
          userAvatar={userAvatar}
          onLogout={handleLogout}
        />
      );
    }
    return component;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onSignUp={handleSignUpClick} onLogin={handleLoginClick} />;

      case "home":
        return (
          <Homepage
            onNavigate={handleNavigate}
            userName={userName}
            userAvatar={userAvatar}
            onLogout={handleLogout}
          />
        );

      case "ask-question":
        return requireToken(<AskQuestionScreen onBack={handleBack} accessToken={accessToken} />);

      case "products":
        return <ProductsScreen onBack={handleBack} onNavigateToLocator={() => handleNavigate("locator")} />;

      case "locator":
        return <ProductLocator onBack={handleBack} />;

      case "education":
        return requireToken(<EducationScreen onBack={handleBack} accessToken={accessToken} />);

      case "community":
        return requireToken(<CommunityScreen onBack={handleBack} accessToken={accessToken} />);

      case "ask-expert":
        return requireToken(<AskExpertScreen onBack={handleBack} accessToken={accessToken} />);

      case "tracker":
        // ✅ This is the key fix: PeriodTracker will ONLY mount with a valid token
        return requireToken(<PeriodTracker onBack={handleBack} accessToken={accessToken} />);

      case "health-tips":
        return requireToken(<HealthTipsScreen onBack={handleBack} accessToken={accessToken} />);

      case "feedback":
        return <FeedbackScreen onBack={handleBack} />;

      case "settings":
        return (
          <SettingsScreen
            onBack={handleBack}
            onLogout={handleLogout}
            accessToken={accessToken}
            userName={userName}
            userAvatar={userAvatar}
            userEmail={userEmail}
            onNavigate={(s) => handleNavigate(s as Screen)}
          />
        );

      case "admin-questions":
        return requireToken(<AdminQuestionsScreen onBack={handleBack} accessToken={accessToken} />);

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
        return (
          <Homepage
            onNavigate={handleNavigate}
            userName={userName}
            userAvatar={userAvatar}
            onLogout={handleLogout}
          />
        );
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
