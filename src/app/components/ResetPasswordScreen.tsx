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

export function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If user landed here from the email link, Supabase will set a recovery session.
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const checkRecovery = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        // In a recovery flow, session may exist after redirect
        if (data?.session?.access_token) {
          setIsRecoveryMode(true);
        }
      } catch (e) {
        // Not fatal
      }
    };

    checkRecovery();
  }, []);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // IMPORTANT: this must be a real URL reachable by the user.
      // While local: window.location.origin will be localhost.
      // Once deployed: it becomes your deployed domain automatically.
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent! Please check your inbox.");
      setEmail("");
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      // Optional: sign out to force fresh login
      await supabase.auth.signOut();

      onDone();
    } catch (err) {
      toast.error("Could not update password. Please try again.");
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

          {!isRecoveryMode ? (
            <>
              <p className="text-sm mb-6" style={{ color: "#776B7D" }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSendResetLink} className="space-y-4">
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
                  {loading ? "Sending..." : "Send Reset Link"}
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

              <Card className="mt-6 p-4 border" style={{ backgroundColor: "#D4C4EC", borderColor: "#B2A0B9" }}>
                <p className="text-sm text-center" style={{ color: "#594F62" }}>
                  If you don't receive an email, check your spam folder or try again.
                </p>
              </Card>
            </>
          ) : (
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
