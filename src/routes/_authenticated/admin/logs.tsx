import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type L = Database["public"]["Tables"]["ai_logs"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/logs")({
  head: () => ({ meta: [{ title: "AI Logs — Admin" }] }),
  component: LogsAdmin,
});

function LogsAdmin() {
  const [logs, setLogs] = useState<L[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ai_logs").select("*").order("created_at", { ascending: false }).limit(200);
      setLogs(data ?? []);
    })();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">AI Logs ({logs.length})</h1>
      <Card className="bg-card/60 border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
            <tr><th className="p-3">When</th><th className="p-3">Feature</th><th className="p-3">Model</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-border/50">
                <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-3">{l.feature}</td>
                <td className="p-3 text-muted-foreground font-mono text-xs">{l.model ?? "—"}</td>
                <td className="p-3"><Badge className={l.success ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>{l.success ? "OK" : "Error"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
