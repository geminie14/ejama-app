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

  useEffect(() => {
    const checkExistingRecoverySession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          setStep("newPassword");
        }
      } catch (e) {
        // Not fatal
      }
    };
    checkExistingRecoverySession();
  }, []);

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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.trim().length < 8) {
      toast.error("Please enter the 8-digit code from your email.");
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

  return
