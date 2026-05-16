import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type P = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const [users, setUsers] = useState<P[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      setUsers(data ?? []);
    })();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Users ({users.length})</h1>
      <Card className="bg-card/60 border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">University</th><th className="p-3">Target</th><th className="p-3">Joined</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-card/40">
                <td className="p-3 font-medium">{u.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.university ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{u.target_role ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
