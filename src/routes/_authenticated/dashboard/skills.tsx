import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { analyzeSkillGap } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/skills")({
  head: () => ({ meta: [{ title: "Skill Gap — SkillBridge AI" }] }),
  component: SkillsPage,
});

type Result = { required: Array<{ skill: string; priority: string; weeks_to_learn: number; reason: string }>; strengths: string[] };

function SkillsPage() {
  const { user } = useAuth();
  const fn = useServerFn(analyzeSkillGap);
  const [target, setTarget] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("target_role").eq("id", user.id).single(),
        supabase.from("user_skills").select("skill_name").eq("user_id", user.id),
      ]);
      if (p?.target_role) setTarget(p.target_role);
      setSkills((s ?? []).map((x) => x.skill_name));
    })();
  }, [user]);

  const analyze = async () => {
    if (!target.trim()) return toast.error("Enter a target role");
    setLoading(true);
    try {
      const r = await fn({ data: { targetRole: target, currentSkills: skills } });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  const priorityColor = (p: string) =>
    p === "high" ? "bg-destructive/15 text-destructive border-destructive/30"
    : p === "medium" ? "bg-warning/15 text-warning border-warning/30"
    : "bg-muted text-muted-foreground border-border";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Skill Gap Analyzer</h1>
      <p className="text-muted-foreground mt-1 mb-8">Pick a target role. See exactly what to learn next.</p>

      <Card className="p-6 bg-card/60 border-border mb-6">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Target role</Label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. Machine Learning Engineer" className="mt-1.5" />
          </div>
          <Button onClick={analyze} disabled={loading} className="bg-gradient-brand text-primary-foreground border-0 h-10">
            <Sparkles className="size-4 mr-2" />{loading ? "Analyzing…" : "Analyze gap"}
          </Button>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Current skills: {skills.length ? skills.join(", ") : "none — add some on your profile"}
        </div>
      </Card>

      {result && (
        <>
          {result.strengths?.length > 0 && (
            <Card className="p-6 bg-card/60 border-border mb-6">
              <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="size-5 text-success" /><h2 className="font-display text-lg font-semibold">You're already strong in</h2></div>
              <div className="flex flex-wrap gap-2">{result.strengths.map((s) => <Badge key={s} className="bg-success/15 text-success border-success/30">{s}</Badge>)}</div>
            </Card>
          )}

          <Card className="p-6 bg-card/60 border-border">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="size-5 text-accent" /><h2 className="font-display text-lg font-semibold">Skills to close the gap</h2></div>
            <div className="space-y-3">
              {result.required.map((r) => (
                <div key={r.skill} className="p-4 rounded-lg border border-border bg-card/40">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-display font-medium">{r.skill}</div>
                      <div className="text-sm text-muted-foreground mt-1">{r.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={priorityColor(r.priority)}>{r.priority}</Badge>
                      <Badge variant="secondary">{r.weeks_to_learn}w</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
