import { createFileRoute, redirect, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, LayoutDashboard, User, Brain, Compass, GitBranch, FileText, Briefcase, MessageCircle, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/careers", label: "Careers", icon: Brain },
  { to: "/dashboard/skills", label: "Skill Gap", icon: Compass },
  { to: "/dashboard/roadmap", label: "Roadmap", icon: GitBranch },
  { to: "/dashboard/resume", label: "Resume ATS", icon: FileText },
  { to: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { to: "/dashboard/mentor", label: "AI Mentor", icon: MessageCircle },
] as const;

function AuthenticatedLayout() {
  const { isAuthenticated, loading, user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav({ to: "/login", search: { redirect: loc.pathname } });
    }
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar p-4 shrink-0">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 mb-6">
          <div className="size-7 rounded-lg bg-gradient-brand grid place-items-center">
            <Sparkles className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">SkillBridge<span className="text-gradient">AI</span></span>
        </Link>
        <nav className="space-y-1 flex-1">
          {NAV.map((n) => {
            const active = loc.pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-card/60"}`}>
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition mt-4 ${loc.pathname.startsWith("/admin") ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-card/60"}`}>
              <Shield className="size-4" /> Admin
            </Link>
          )}
        </nav>
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="px-2 text-xs text-muted-foreground truncate">{user?.email}</div>
            <ThemeToggle className="size-8 shrink-0" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => { signOut().then(() => nav({ to: "/" })); }} className="w-full justify-start text-muted-foreground">
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
