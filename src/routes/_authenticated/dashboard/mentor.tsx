import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { mentorChat } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/mentor")({
  head: () => ({ meta: [{ title: "AI Mentor — SkillBridge AI" }] }),
  component: MentorPage,
});

type Msg = { id?: string; role: string; content: string };
type Thread = { id: string; title: string; updated_at: string };

function MentorPage() {
  const { user } = useAuth();
  const fn = useServerFn(mentorChat);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_threads").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    setThreads(data ?? []);
    if (!activeId && data?.[0]) setActiveId(data[0].id);
  };

  useEffect(() => { void loadThreads(); }, [user]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("thread_id", activeId).order("created_at");
      setMessages(data ?? []);
    })();
  }, [activeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "…" }]);
    try {
      const r = await fn({ data: { threadId: activeId ?? undefined, message: text } });
      if (!activeId) setActiveId(r.threadId);
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: r.reply }]);
      void loadThreads();
    } catch (e) {
      setMessages((m) => m.slice(0, -2));
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  const newThread = () => { setActiveId(null); setMessages([]); };

  return (
    <div className="flex h-[calc(100vh-0px)]">
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/30 p-4 shrink-0">
        <Button onClick={newThread} variant="outline" className="mb-4 justify-start"><Plus className="size-4 mr-2" />New chat</Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-left p-2 rounded-md text-sm truncate transition ${activeId === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-card/60"}`}>
              <MessageCircle className="size-3 inline mr-2" />{t.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border p-4 flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center"><Sparkles className="size-4 text-primary-foreground" /></div>
          <div>
            <div className="font-display font-semibold">AI Career Mentor</div>
            <div className="text-xs text-muted-foreground">Frontier model · always on</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-xl mx-auto text-center py-20">
              <Sparkles className="size-10 mx-auto text-accent mb-4" />
              <h2 className="font-display text-2xl font-semibold">How can I help your career today?</h2>
              <p className="text-muted-foreground mt-2">Ask about career direction, interview prep, learning paths, or motivation.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-2 text-left">
                {["What career fits me if I love design + code?","Mock interview me for a frontend internship","Build a 4-week plan to learn data analysis","How do I get into AI without a CS degree?"].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="p-3 rounded-lg border border-border text-sm hover:bg-card/60 transition">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && (
                <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center shrink-0 mt-1"><Sparkles className="size-4 text-primary-foreground" /></div>
              )}
              <Card className={`p-4 max-w-2xl ${m.role === "user" ? "bg-primary/10 border-primary/30" : "bg-card/60 border-border"}`}>
                <div className="prose prose-sm prose-invert max-w-none [&_*]:text-foreground [&_p]:text-foreground/90">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </Card>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto flex gap-2 items-end">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask your mentor anything…" rows={2} className="resize-none" />
            <Button onClick={send} disabled={busy || !input.trim()} className="bg-gradient-brand text-primary-foreground border-0 h-auto py-3">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
