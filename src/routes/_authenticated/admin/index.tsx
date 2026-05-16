import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, Brain, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — SkillBridge AI" }] }),
  component: AdminHome,
});

function AdminHome() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, careers: 0, chats: 0, aiCalls: 0 });

  useEffect(() => {
    (async () => {
      const [u, j, c, ch, ai] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("career_recommendations").select("*", { count: "exact", head: true }),
        supabase.from("chat_threads").select("*", { count: "exact", head: true }),
        supabase.from("ai_logs").select("*", { count: "exact", head: true }),
      ]);
      setStats({ users: u.count ?? 0, jobs: j.count ?? 0, careers: c.count ?? 0, chats: ch.count ?? 0, aiCalls: ai.count ?? 0 });
    })();
  }, []);

  const cards = [
    { label: "Users", value: stats.users, icon: Users },
    { label: "Jobs", value: stats.jobs, icon: Briefcase },
    { label: "Career recs", value: stats.careers, icon: Brain },
    { label: "Chats", value: stats.chats, icon: MessageCircle },
    { label: "AI calls", value: stats.aiCalls, icon: Brain },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">Platform Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 bg-card/60 border-border">
            <c.icon className="size-5 text-accent mb-2" />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="font-display text-3xl font-semibold mt-1">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
