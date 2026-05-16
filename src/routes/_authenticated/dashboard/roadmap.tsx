import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { generateRoadmap } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GitBranch, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — SkillBridge AI" }] }),
  component: RoadmapPage,
});

type Phase = { id: string; title: string; weeks: number; description: string; skills: string[]; resources: Array<{ title: string; url: string; type: string }> };
type Result = { phases: Phase[]; estimated_weeks: number };

function RoadmapPage() {
  const { user } = useAuth();
  const fn = useServerFn(generateRoadmap);
  const [target, setTarget] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("target_role").eq("id", user.id).single();
      if (p?.target_role) setTarget(p.target_role);
      const { data: last } = await supabase.from("roadmaps").select("nodes, estimated_weeks, target_role").eq("user_id", user.id).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      if (last) {
        const phases = (last.nodes as Array<{ data: { label: string; weeks: number; description: string; skills: string[]; resources: Phase["resources"] }; id: string }>).map((n) => ({
          id: n.id, title: n.data.label, weeks: n.data.weeks, description: n.data.description, skills: n.data.skills, resources: n.data.resources,
        }));
        setResult({ phases, estimated_weeks: last.estimated_weeks ?? 0 });
        setTarget(last.target_role);
      }
    })();
  }, [user]);

  const generate = async () => {
    if (!target.trim()) return toast.error("Pick a target role");
    setLoading(true);
    try {
      const r = await fn({ data: { targetRole: target, level } });
      setResult(r);
      toast.success("Roadmap generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Personalized Roadmap</h1>
      <p className="text-muted-foreground mt-1 mb-8">A step-by-step path from where you are to job-ready.</p>

      <Card className="p-6 bg-card/60 border-border mb-6">
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Target role</Label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. Product Designer" className="mt-1.5" />
          </div>
          <div>
            <Label>Starting level</Label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1.5 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-brand text-primary-foreground border-0 h-10">
            <Sparkles className="size-4 mr-2" />{loading ? "Building…" : "Generate"}
          </Button>
        </div>
      </Card>

      {result && (
        <>
          <Card className="p-5 bg-card/60 border-border mb-6 flex items-center gap-6">
            <div className="flex items-center gap-2"><Clock className="size-5 text-accent" /><div><div className="text-xs text-muted-foreground">Total time</div><div className="font-display text-xl font-semibold">{result.estimated_weeks} weeks</div></div></div>
            <div className="flex items-center gap-2"><GitBranch className="size-5 text-accent" /><div><div className="text-xs text-muted-foreground">Phases</div><div className="font-display text-xl font-semibold">{result.phases.length}</div></div></div>
          </Card>

          <div className="space-y-4 relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-accent to-transparent opacity-40" />
            {result.phases.map((p, i) => (
              <Card key={p.id} className="p-6 bg-card/60 border-border relative ml-12">
                <div className="absolute -left-[3.25rem] top-6 size-10 rounded-full bg-gradient-brand grid place-items-center font-display font-semibold text-primary-foreground glow-ring">
                  {i + 1}
                </div>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  <Badge variant="secondary">{p.weeks} weeks</Badge>
                </div>
                {p.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                )}
                {p.resources?.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Resources</div>
                    {p.resources.map((r, j) => (
                      <a key={j} href={r.url} target="_blank" rel="noopener" className="flex items-center justify-between p-2 rounded hover:bg-card/80 text-sm border border-border/50">
                        <span><Badge variant="outline" className="mr-2 text-[10px]">{r.type}</Badge>{r.title}</span>
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
