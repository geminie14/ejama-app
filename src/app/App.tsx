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

// ✅ UPDATED: include all screens you actually use in renderScreen()
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

// ✅ helper: read Community Q&A mode from URL (?qa=ask|browse)
const getQaModeFromUrl = (): "home" | "ask" | "browse" => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qa = params.get("qa");
    if (qa === "ask") return "ask";
    if (qa === "browse") return "browse";
    return "home";
  } catch {
    return "home";
  }
};

// ✅ helper: keep URL in sync (optional but makes behavior consistent)
const setUrlScreen = (screen: Screen, qa?: "ask" | "browse") => {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set("screen", screen);

    if (screen === "community" && qa) params.set("qa", qa);
    else params.delete("qa");

    const next = `/?${params.toString()}`;
    window.history.pushState({}, "", next);
  } catch {
    // ignore
  }
};

export default function App() {
  const SCREEN_KEY = "ejama_current_screen";

  const saveScreen = (screen: Screen) => {
    localStorage.setItem(SCREEN_KEY, screen);
  };

  const loadSavedScreen = (): Screen | null => {
    return localStorage.getItem(SCREEN_KEY) as Screen | null;
  };

  // ✅ UPDATED: include all valid screens (except welcome/reset-password which you handle separately)
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

  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
        const next =
          saved && allowedScreens.includes(saved) ? saved : "home";

        setCurrentScreen(next);
        setUrlScreen(next); // ✅ keeps URL consistent
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
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

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
    const next =
      saved && allowedScreens.includes(saved) ? saved : "home";

    setCurrentScreen(next);
    saveScreen(next);
    setUrlScreen(next);

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

    // Optional: clear URL
    try {
      window.history.pushState({}, "", "/");
    } catch {}
  };

  // ✅ UPDATED: keep Screen typing + URL sync.
  const handleNavigate = (screen: string) => {
    const next = screen as Screen;

    if (!allowedScreens.includes(next)) return;

    setCurrentScreen(next);
    saveScreen(next);

    // If Homepage set ?qa=ask before calling onNavigate("community"),
    // we keep it. Otherwise, we clear qa when leaving community.
    if (next === "community") {
      const qa = new URLSearchParams(window.location.search).get("qa");
      if (qa === "ask" || qa === "browse") setUrlScreen(next, qa);
      else setUrlScreen(next);
    } else {
      setUrlScreen(next);
    }
  };

  const handleBack = () => {
    setCurrentScreen("home");
    saveScreen("home");
    setUrlScreen("home");
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
        return (
          <Homepage
            onNavigate={handleNavigate}
            userName={userName}
            userAvatar={userAvatar}
            onLogout={handleLogout}
          />
        );

      case "ask-question":
        return (
          <AskQuestionScreen onBack={handleBack} accessToken={accessToken} />
        );

      case "products":
        return (
          <ProductsScreen
            onBack={handleBack}
            onNavigateToLocator={() => handleNavigate("locator")}
          />
        );

      case "locator":
        return <ProductLocator onBack={handleBack} />;

      case "education":
        return <EducationScreen onBack={handleBack} accessToken={accessToken} />;

      case "community":
        return (
          <CommunityScreen
            onBack={handleBack}
            accessToken={accessToken}
            // ✅ THIS is where answers are viewed: Community → Browse Answered Questions
            initialQaMode={getQaModeFromUrl()}
          />
        );

      case "ask-expert":
        return <AskExpertScreen onBack={handleBack} accessToken={accessToken} />;

      case "tracker":
        return <PeriodTracker onBack={handleBack} accessToken={accessToken} />;

      case "health-tips":
        return <HealthTipsScreen onBack={handleBack} accessToken={accessToken} />;

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
            onNavigate={(s) => handleNavigate(s)}
          />
        );

      case "admin-questions":
        return (
          <AdminQuestionsScreen onBack={handleBack} accessToken={accessToken} />
        );

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
