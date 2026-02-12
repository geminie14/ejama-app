"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { getSupabaseClient } from "@/utils/supabase/client";
import { supabaseUrl, supabaseAnonKey } from "@/utils/supabase/info";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "signup" | "login";
  onSuccess: (accessToken: string) => void;
  onForgotPassword: () => void;
}

export function AuthDialog({
  open,
  onClose,
  mode,
  onSuccess,
  onForgotPassword,
}: AuthDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const TEMP_SESSION_KEY = "ejama_temp_session";

  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasSupabaseConfig) {
      toast.error(
        "Supabase config is missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Call your Supabase Edge Function for signup
        // NOTE: Your original URL included: /functions/v1/make-server-1aee76a8/signup
        // Keep it the same, just base it on supabaseUrl.
        const endpoint = `${supabaseUrl}/functions/v1/make-server-1aee76a8/signup`;

        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              email: email.trim(),
              password,
              name: name.trim(),
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            toast.error(data?.error || "Signup failed");
            return;
          }

          toast.success("Account created! Please login.");
          setEmail("");
          setPassword("");
          setName("");
        } catch (fetchError) {
          console.error("Signup network error:", fetchError);
          toast.error(
            "Network error. Please check your connection and try again."
          );
          return;
        }
      } else {
        // Login
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.session?.access_token) {
          if (!keepSignedIn) {
            sessionStorage.setItem(TEMP_SESSION_KEY, "1");
          } else {
            sessionStorage.removeItem(TEMP_SESSION_KEY);
          }

          toast.success("Logged in successfully!");
          onSuccess(data.session.access_token);
          onClose();
        } else {
          toast.error("Login failed: no session returned.");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasSupabaseConfig) {
      toast.error(
        "Supabase config is missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    if (!keepSignedIn) {
      sessionStorage.setItem(TEMP_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(TEMP_SESSION_KEY);
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // Optional: You can add redirectTo if you have a callback route
      // options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ color: "#594F62" }}>
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Sign up to access Ejama's menstrual health resources and community."
              : "Log in to your Ejama account to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-2 text-sm"
                style={{ color: "#776B7D" }}
              >
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                Keep me signed in
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-semibold hover:underline"
                style={{ color: "#A592AB" }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-white"
            style={{ backgroundColor: "#A592AB" }}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "signup"
              ? "Sign Up"
              : "Login"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            style={{ borderColor: "#A592AB", color: "#594F62" }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
