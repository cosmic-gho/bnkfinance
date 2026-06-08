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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.signIn(email, password);
      
      const admin = await isAdmin();
      router.push(admin ? "/admin" : "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setIsLoading(false);
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
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
        <div>
          <Label htmlFor="email">Email</Label>
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
        </div>
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
      <p className="mt-4 text-sm text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="text-emerald-600 hover:text-emerald-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
