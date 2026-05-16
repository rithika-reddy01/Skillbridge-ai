import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { Shield, Users, Briefcase, Activity, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: Activity },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/admin/logs", label: "AI Logs", icon: Shield },
] as const;

function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/dashboard" });
  }, [loading, isAdmin]);

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card/30 px-6 py-4 flex items-center gap-6">
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"><ArrowLeft className="size-4" /> Back</Link>
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-accent" />
          <span className="font-display font-semibold">Admin</span>
        </div>
        <nav className="flex gap-1 ml-4">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition ${loc.pathname === n.to ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <n.icon className="size-3.5" />{n.label}
            </Link>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
