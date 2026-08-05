import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Lock } from "lucide-react";

interface AuthGateProps {
  onBack: () => void;
  onSignUp: () => void;
  onLogin: () => void;
  feature: string; // e.g. "track your cycle"
}

export function AuthGate({ onBack, onSignUp, onLogin, feature }: AuthGateProps) {
  return (
    <div className="min-h-screen bg-[#E7DDFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          style={{ color: "#A592AB" }}
          className="hover:bg-[#D4C4EC] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 bg-white text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#EDE7FF" }}
          >
            <Lock className="w-6 h-6" style={{ color: "#7C3AED" }} />
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: "#594F62" }}>
            Create a free account to {feature}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#776B7D" }}>
            Everything else in Ejama is free to browse without an account.
            This feature saves personal data, so we ask you to sign up first.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onSignUp}
              className="w-full text-white"
              style={{ backgroundColor: "#A592AB" }}
            >
              Sign Up
            </Button>
            <Button
              onClick={onLogin}
              variant="outline"
              className="w-full"
              style={{ borderColor: "#A592AB", color: "#A592AB" }}
            >
              Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
