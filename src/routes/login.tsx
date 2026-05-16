import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SkillBridge AI" }] }),
  validateSearch: searchSchema,
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      nav({ to: redirect ?? "/dashboard" });
    }
  }, [isAuthenticated, loading]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    nav({ to: redirect ?? "/dashboard" });
  };

  const google = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google");
    if (error) toast.error(error.message);
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your career journey.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={busy} className="w-full bg-gradient-brand text-primary-foreground border-0 h-11">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <Divider />
      <Button variant="outline" onClick={google} className="w-full h-11">Continue with Google</Button>
      <p className="text-center text-sm text-muted-foreground mt-6">
        New here? <Link to="/signup" className="text-accent hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden">
        <div className="aurora" />
        <div className="relative max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="size-9 rounded-lg bg-gradient-brand grid place-items-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-xl">SkillBridge<span className="text-gradient">AI</span></span>
          </Link>
          <h2 className="font-display text-4xl font-semibold tracking-tight leading-tight">
            Your AI career coach, <span className="text-gradient">always on</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Personalized roadmaps, resume intelligence, and real internships — built for the next
            generation of students.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md p-8 bg-card/60 border-border glass">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">SkillBridge<span className="text-gradient">AI</span></span>
          </Link>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">{subtitle}</p>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px bg-border flex-1" /> or <div className="h-px bg-border flex-1" />
    </div>
  );
}
