import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Briefcase, FileText, GitBranch, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — SkillBridge AI" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });
  const { data: careers } = useQuery({
    queryKey: ["careers-top", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("career_recommendations").select("*").eq("user_id", user!.id).order("confidence", { ascending: false }).limit(3);
      return data ?? [];
    },
  });
  const { data: skillCount } = useQuery({
    queryKey: ["skill-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("user_skills").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
  });
  const { data: lastResume } = useQuery({
    queryKey: ["last-resume", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("resumes").select("ats_score").eq("user_id", user!.id).order("analyzed_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const readiness = profile?.readiness_score ?? Math.min(95, (skillCount ?? 0) * 5 + (careers?.length ? 20 : 0) + (lastResume?.ats_score ? 25 : 0));
  const name = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Welcome back, <span className="text-gradient">{name}</span>.
        </h1>
        <p className="text-muted-foreground mt-1">Here's where your career stands today.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-card/60 border-border md:col-span-2 relative overflow-hidden">
          <div className="aurora opacity-40" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Career Readiness</div>
            <div className="mt-2 flex items-end gap-3">
              <div className="text-6xl font-display font-semibold text-gradient">{readiness}</div>
              <div className="text-sm text-muted-foreground mb-2">/ 100</div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-brand transition-all" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Add skills, generate a roadmap, and analyze your resume to grow this score.</p>
          </div>
        </Card>
        <Card className="p-6 bg-card/60 border-border">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Skills tracked</div>
          <div className="mt-2 text-4xl font-display font-semibold">{skillCount ?? 0}</div>
          <Link to="/dashboard/profile" className="text-sm text-accent hover:underline mt-3 inline-block">Edit profile →</Link>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <QuickAction to="/dashboard/careers" icon={Brain} title="AI Career Discovery" desc="Get 5 personalized career matches in 30 seconds." />
        <QuickAction to="/dashboard/skills" icon={GitBranch} title="Skill Gap Analyzer" desc="See exactly what to learn next." />
        <QuickAction to="/dashboard/resume" icon={FileText} title="Resume ATS Scan" desc="Score your resume & get rewrites." />
        <QuickAction to="/dashboard/jobs" icon={Briefcase} title="Browse Internships" desc="Curated entry roles matched to you." />
      </div>

      {careers && careers.length > 0 && (
        <Card className="p-6 bg-card/60 border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Your top career matches</h2>
            <Link to="/dashboard/careers" className="text-sm text-accent hover:underline">View all →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {careers.map((c) => (
              <div key={c.id} className="p-4 rounded-lg border border-border bg-card/40">
                <div className="font-display font-medium">{c.role}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.confidence}% match · {c.demand} demand</div>
                <div className="mt-2 text-xs text-success flex items-center gap-1"><CheckCircle2 className="size-3" /> ${c.salary_min?.toLocaleString()}–${c.salary_max?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, desc }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Link to={to}>
      <Card className="p-5 bg-card/60 border-border hover:border-primary/40 transition-colors group cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
            <Icon className="size-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-medium flex items-center justify-between">
              {title} <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
