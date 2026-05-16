import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { recommendCareers } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/careers")({
  head: () => ({ meta: [{ title: "Careers — SkillBridge AI" }] }),
  component: CareersPage,
});

type Career = {
  id: string;
  role: string;
  confidence: number;
  demand: string | null;
  salary_min: number | null;
  salary_max: number | null;
  required_skills: unknown;
  description: string | null;
  reasoning: string | null;
};

function CareersPage() {
  const { user } = useAuth();
  const fn = useServerFn(recommendCareers);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("career_recommendations").select("*").eq("user_id", user.id).order("confidence", { ascending: false });
    setCareers((data as Career[]) ?? []);
  };
  useEffect(() => { void load(); }, [user]);

  const generate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: profile }, { data: skills }, { data: ints }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_skills").select("skill_name").eq("user_id", user.id),
        supabase.from("interests").select("tag").eq("user_id", user.id),
      ]);
      await fn({ data: {
        skills: (skills ?? []).map((s) => s.skill_name),
        interests: (ints ?? []).map((i) => i.tag),
        goals: profile?.career_goals ?? "",
        education: profile?.education ?? "",
      }});
      await load();
      toast.success("Fresh career matches generated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">AI Career Discovery</h1>
          <p className="text-muted-foreground mt-1">Personalized to your skills, interests, and goals.</p>
        </div>
        <Button onClick={generate} disabled={loading} className="bg-gradient-brand text-primary-foreground border-0">
          {loading ? <><RefreshCw className="size-4 mr-2 animate-spin" />Thinking…</> : <><Sparkles className="size-4 mr-2" />{careers.length ? "Regenerate" : "Generate matches"}</>}
        </Button>
      </div>

      {careers.length === 0 && !loading && (
        <Card className="p-12 bg-card/40 border-dashed border-border text-center">
          <Sparkles className="size-10 mx-auto text-accent mb-4" />
          <h2 className="font-display text-xl font-semibold">No matches yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Fill out your <Link to="/dashboard/profile" className="text-accent hover:underline">profile</Link> with skills & interests, then click Generate.</p>
        </Card>
      )}

      <div className="space-y-4">
        {careers.map((c, i) => {
          const reqSkills = Array.isArray(c.required_skills) ? c.required_skills as string[] : [];
          return (
            <Card key={c.id} className="p-6 bg-card/60 border-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-muted-foreground">#{i + 1} match</div>
                  <h3 className="font-display text-xl font-semibold mt-1">{c.role}</h3>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl font-semibold text-gradient">{c.confidence}%</div>
                  <div className="text-xs text-muted-foreground">match score</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
              {c.reasoning && <p className="mt-2 text-xs italic text-muted-foreground border-l-2 border-accent/50 pl-3">{c.reasoning}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <Badge className="bg-accent/15 text-accent border-accent/30"><TrendingUp className="size-3 mr-1" />{c.demand} demand</Badge>
                {c.salary_min != null && (
                  <Badge variant="secondary"><DollarSign className="size-3 mr-1" />${c.salary_min.toLocaleString()}–${c.salary_max?.toLocaleString()}</Badge>
                )}
              </div>
              {reqSkills.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Key skills</div>
                  <div className="flex flex-wrap gap-1.5">{reqSkills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
