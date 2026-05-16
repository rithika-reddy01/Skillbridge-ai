import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type J = Database["public"]["Tables"]["jobs"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  head: () => ({ meta: [{ title: "Jobs — Admin" }] }),
  component: JobsAdmin,
});

function JobsAdmin() {
  const [jobs, setJobs] = useState<J[]>([]);
  const load = async () => {
    const { data } = await supabase.from("jobs").select("*").order("posted_at", { ascending: false }).limit(200);
    setJobs(data ?? []);
  };
  useEffect(() => { void load(); }, []);

  const toggle = async (j: J) => {
    const { error } = await supabase.from("jobs").update({ active: !j.active }).eq("id", j.id);
    if (error) return toast.error(error.message);
    toast.success(j.active ? "Hidden" : "Activated");
    void load();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Jobs ({jobs.length})</h1>
      <div className="space-y-2">
        {jobs.map((j) => (
          <Card key={j.id} className="p-4 bg-card/60 border-border flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{j.title} <span className="text-muted-foreground">· {j.company}</span></div>
              <div className="text-xs text-muted-foreground">{j.location ?? ""}{j.remote ? " · Remote" : ""} · {j.level}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={j.active ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>{j.active ? "Active" : "Hidden"}</Badge>
              <Button size="sm" variant="outline" onClick={() => toggle(j)}>{j.active ? "Hide" : "Show"}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
