"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const admin = await isAdmin();
        router.push(admin ? "/admin" : "/dashboard");
      }
    };
    checkSession();
  }, []); // Empty dependency array - only run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.signIn(email, password);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !user?.id) throw new Error("Missing user session");
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ login_otp_code: code, login_otp_expires: expires })
        .eq("id", user.id);
      if (updateError) throw updateError;
      setUseOtp(true);
      setOtpSent(true);
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          title: "Login Verification Code",
          message: `Your verification code is: ${code}\nThis code expires in 10 minutes.`,
        }),
      });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    setIsSendingOtp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email || !user?.id) throw new Error("Missing user session");
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ login_otp_code: code, login_otp_expires: expires })
        .eq("id", user.id);
      if (updateError) throw updateError;
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          title: "Login Verification Code",
          message: `Your verification code is: ${code}\nThis code expires in 10 minutes.`,
        }),
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setIsVerifyingOtp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("Missing user session");
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("login_otp_code, login_otp_expires")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      if (!profile?.login_otp_code || !profile?.login_otp_expires) throw new Error("No OTP requested");
      const expired = new Date(profile.login_otp_expires).getTime() < Date.now();
      if (expired) throw new Error("OTP expired");
      if (profile.login_otp_code !== otpCode) throw new Error("Invalid OTP");
      const { error: clearError } = await supabase
        .from("user_profiles")
        .update({ login_otp_code: null, login_otp_expires: null })
        .eq("id", user.id);
      if (clearError) throw clearError;
      const admin = await isAdmin();
      router.push(admin ? "/admin" : "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-8 bg-card rounded-xl shadow-sm border border-border">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to BNK Finance Bank</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      {!useOtp ? (
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">Email</Label>
            <button
              type="button"
              className="text-xs text-emerald-600 hover:text-emerald-700"
              onClick={() => {
                setUseOtp(true);
                setError(null);
              }}
            >
              Use OTP instead
            </button>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="Enter your email"
            aria-describedby="email-error"
          />
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your password"
              aria-describedby="password-error"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-label={isLoading ? "Logging in" : "Login"}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4" aria-label="OTP login form">
          <div className="flex items-center justify-between">
            <Label htmlFor="otp-email">Email</Label>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setUseOtp(false);
                setOtpSent(false);
                setOtpCode("");
                setError(null);
              }}
            >
              Use password instead
            </button>
          </div>
          <Input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="Enter your email"
            disabled={otpSent}
          />
          {!otpSent ? (
            <Button
              type="button"
              className="w-full"
              disabled={isSendingOtp || !email}
              onClick={handleSendOtp}
            >
              {isSendingOtp ? "Sending code..." : "Send OTP code"}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Enter OTP code</Label>
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={isVerifyingOtp || otpCode.length !== 6}
                  onClick={handleVerifyOtp}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSendingOtp}
                  onClick={handleSendOtp}
                >
                  Resend
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      <p className="mt-4 text-sm text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="text-emerald-600 hover:text-emerald-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
