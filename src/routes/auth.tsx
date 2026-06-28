import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — NOVA AI" }, { name: "description", content: "Sign in to NOVA AI." }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden md:flex flex-col justify-between p-10 aurora relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="size-9 rounded-xl nova-gradient grid place-items-center shadow-[0_0_30px_oklch(0.68_0.22_290/0.6)]">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-xl font-semibold">NOVA<span className="text-muted-foreground">.ai</span></span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">Your AI <span className="nova-text">career copilot</span>.</h1>
          <p className="mt-4 text-muted-foreground">Resumes, cover letters, mock interviews, applications — all in one premium workspace.</p>
          <div className="mt-8 glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ATS Score</span>
              <span className="text-xs text-[var(--nova-cyan)]">+18 this week</span>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <span className="text-5xl font-semibold nova-text">92</span>
              <span className="text-muted-foreground text-sm pb-1.5">/ 100</span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full nova-gradient" style={{ width: "92%" }} />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground relative z-10">Trusted by 12,000+ builders.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden flex items-center gap-2.5 mb-8">
            <div className="size-9 rounded-xl nova-gradient grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-xl font-semibold">NOVA.ai</span>
          </Link>

          <h2 className="text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue building." : "Free forever for students."}
          </p>

          <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full mt-6 glass border-border/60 hover:bg-white/5">
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v2.8h7.9c-.3 1.8-2.2 5.4-7.9 5.4-4.8 0-8.7-3.9-8.7-8.7S7.2 1.8 12 1.8c2.7 0 4.5 1.2 5.6 2.2l3.8-3.7C19 .3 15.8-1 12-1 5.4-1 0 4.4 0 11s5.4 12 12 12c6.9 0 11.5-4.9 11.5-11.8 0-.8-.1-1.4-.2-2.2H12z"/></svg>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" className="mt-1.5 glass border-border/60" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className="mt-1.5 glass border-border/60" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 glass border-border/60" />
            </div>
            <Button type="submit" disabled={loading} className="w-full nova-gradient text-white border-0 hover:opacity-90">
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline-offset-4 hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
