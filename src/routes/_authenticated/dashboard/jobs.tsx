import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Database } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, DollarSign, Bookmark, BookmarkCheck, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard/jobs")({
  head: () => ({ meta: [{ title: "Jobs — SkillBridge AI" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [level, setLevel] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: js }, { data: sv }] = await Promise.all([
        supabase.from("jobs").select("*").eq("active", true).order("posted_at", { ascending: false }).limit(200),
        supabase.from("saved_jobs").select("job_id").eq("user_id", user.id),
      ]);
      setJobs(js ?? []);
      setSaved(new Set((sv ?? []).map((s) => s.job_id)));
    })();
  }, [user]);

  const toggleSave = async (jobId: string) => {
    if (!user) return;
    if (saved.has(jobId)) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      saved.delete(jobId); setSaved(new Set(saved));
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
      setSaved(new Set([...saved, jobId]));
      toast.success("Saved");
    }
  };

  const filtered = jobs.filter((j) => {
    if (remoteOnly && !j.remote) return false;
    if (level !== "all" && j.level !== level) return false;
    if (q && !`${j.title} ${j.company} ${j.location ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Internships & Entry Jobs</h1>
      <p className="text-muted-foreground mt-1 mb-8">Curated opportunities matched to your level.</p>

      <Card className="p-4 bg-card/60 border-border mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search title, company, location…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="all">All levels</option>
            <option value="internship">Internship</option>
            <option value="entry">Entry</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
            Remote only
          </label>
          <Badge variant="outline"><Filter className="size-3 mr-1" />{filtered.length} jobs</Badge>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((j) => {
          const skills = Array.isArray(j.required_skills) ? j.required_skills as string[] : [];
          const isSaved = saved.has(j.id);
          return (
            <Card key={j.id} className="p-6 bg-card/60 border-border hover:border-primary/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{j.company}</div>
                  <h3 className="font-display text-lg font-semibold mt-1 truncate">{j.title}</h3>
                </div>
                <button onClick={() => toggleSave(j.id)} className="text-muted-foreground hover:text-accent shrink-0">
                  {isSaved ? <BookmarkCheck className="size-5 text-accent" /> : <Bookmark className="size-5" />}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {j.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{j.location}</span>}
                {j.remote && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
                <Badge variant="outline" className="text-[10px] capitalize">{j.level}</Badge>
              </div>
              {j.salary_min != null && (
                <div className="mt-2 flex items-center gap-1 text-xs text-success"><DollarSign className="size-3" />${j.salary_min.toLocaleString()}–${j.salary_max?.toLocaleString()}</div>
              )}
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{j.description}</p>
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">{skills.slice(0, 5).map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}</div>
              )}
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground border-0 flex-1">
                  <a href={j.apply_url ?? "#"} target="_blank" rel="noopener"><Briefcase className="size-4 mr-1" />Apply <ExternalLink className="size-3 ml-1" /></a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Card className="p-12 bg-card/40 border-dashed text-center">
          <p className="text-muted-foreground">No jobs match your filters.</p>
        </Card>
      )}
    </div>
  );
}
