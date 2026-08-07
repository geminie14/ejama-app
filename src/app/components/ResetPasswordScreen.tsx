import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { getSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface ResetPasswordScreenProps {
  onDone: () => void;
}

type Step = "request" | "verify" | "newPassword";

export function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fallback: if a user somehow still lands here via a working link
  // (recovery session already active), skip straight to "set new password".
  useEffect(() => {
    const checkExistingRecoverySession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          setStep("newPassword");
        }
      } catch (e) {
        // Not fatal — just means no existing session, proceed with code flow
      }
    };
    checkExistingRecoverySession();
  }, []);

  // Step 1: request a code be sent to the user's email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("A reset code has been sent to your email.");
      setStep("verify");
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the 6-digit code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.trim().length < 6) {
      toast.error("Please enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "recovery",
      });

      if (error) {
        toast.error(error.message || "Invalid or expired code. Please try again.");
        return;
      }

      toast.success("Code verified! Set your new password below.");
      setStep("newPassword");
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: set the new password (session already established by verifyOtp)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully. Please login.");
      setNewPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();
      onDone();
    } catch (err) {
      toast.error("Could not update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("A new code has been sent to your email.");
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7DDFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onDone}
            style={{ color: "#A592AB" }}
            className="hover:bg-[#D4C4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="p-8 bg-white">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#594F62" }}>
            Reset Password
          </h1>

          {step === "request" && (
            <>
              <p className="text-sm mb-6" style={{ color: "#776B7D" }}>
                Enter your email address and we'll send you a code to reset your password.
              </p>

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white"
                  style={{ backgroundColor: "#A592AB" }}
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: "#776B7D" }}>
                  Remember your password?{" "}
                  <button
                    onClick={onDone}
                    className="font-semibold hover:underline"
                    style={{ color: "#A592AB" }}
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </>
          )}

          {step === "verify" && (
            <>
              <p className="text-sm mb-6" style={{ color: "#776B7D" }}>
                Enter the 6-digit code sent to <strong>{email}</strong>.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Reset Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white"
                  style={{ backgroundColor: "#A592AB" }}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm" style={{ color: "#776B7D" }}>
                  Didn't get a code?{" "}
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="font-semibold hover:underline"
                    style={{ color: "#A592AB" }}
                  >
                    Resend
                  </button>
                </p>
              </div>

              <Card className="mt-6 p-4 border" style={{ backgroundColor: "#D4C4EC", borderColor: "#B2A0B9" }}>
                <p className="text-sm text-center" style={{ color: "#594F62" }}>
                  If you don't receive a code, check your spam folder.
                </p>
              </Card>
            </>
          )}

          {step === "newPassword" && (
            <>
              <p className="text-sm mb-6" style={{ color: "#776B7D" }}>
                Enter your new password below.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white"
                  style={{ backgroundColor: "#A592AB" }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
