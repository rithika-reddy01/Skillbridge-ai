import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/resume")({
  head: () => ({ meta: [{ title: "Resume ATS — SkillBridge AI" }] }),
  component: ResumePage,
});

type Result = {
  ats_score: number; formatting_score: number;
  keywords_found: string[]; keywords_missing: string[];
  suggestions: Array<{ section: string; original: string; improved: string; reason: string }>;
  summary: string;
};

function ResumePage() {
  const fn = useServerFn(analyzeResume);
  const [text, setText] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onFile = async (f: File) => {
    const txt = await f.text();
    setText(txt);
    toast.success("Loaded text from file. PDFs may need copy-paste.");
  };

  const analyze = async () => {
    if (text.length < 50) return toast.error("Paste at least a snippet of your resume.");
    setLoading(true);
    try {
      const r = await fn({ data: { resumeText: text, targetRole: role } });
      setResult(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Resume ATS Intelligence</h1>
      <p className="text-muted-foreground mt-1 mb-8">Score your resume against ATS systems and get AI-rewritten bullets.</p>

      <Card className="p-6 bg-card/60 border-border mb-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Label>Target role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Upload (.txt)</Label>
            <Input type="file" accept=".txt,.md" className="mt-1.5" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          </div>
        </div>
        <Label>Resume text</Label>
        <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your full resume text here…" className="mt-1.5 font-mono text-xs" />
        <Button onClick={analyze} disabled={loading} className="mt-4 bg-gradient-brand text-primary-foreground border-0">
          <Sparkles className="size-4 mr-2" />{loading ? "Scoring…" : "Analyze resume"}
        </Button>
      </Card>

      {result && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6 bg-card/60 border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">ATS Score</div>
              <div className={`mt-2 font-display text-6xl font-semibold ${scoreColor(result.ats_score)}`}>{result.ats_score}</div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-brand" style={{ width: `${result.ats_score}%` }} />
              </div>
            </Card>
            <Card className="p-6 bg-card/60 border-border">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Formatting</div>
              <div className={`mt-2 font-display text-6xl font-semibold ${scoreColor(result.formatting_score)}`}>{result.formatting_score}</div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${result.formatting_score}%` }} />
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card/60 border-border mb-6">
            <div className="flex items-start gap-3">
              <FileText className="size-5 text-accent mt-1" />
              <div>
                <h2 className="font-display text-lg font-semibold">Summary</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{result.summary}</p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6 bg-card/60 border-border">
              <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="size-4 text-success" /><h3 className="font-display font-semibold">Keywords found</h3></div>
              <div className="flex flex-wrap gap-1.5">{result.keywords_found.map((k) => <Badge key={k} className="bg-success/15 text-success border-success/30">{k}</Badge>)}</div>
            </Card>
            <Card className="p-6 bg-card/60 border-border">
              <div className="flex items-center gap-2 mb-3"><XCircle className="size-4 text-destructive" /><h3 className="font-display font-semibold">Keywords missing</h3></div>
              <div className="flex flex-wrap gap-1.5">{result.keywords_missing.map((k) => <Badge key={k} className="bg-destructive/15 text-destructive border-destructive/30">{k}</Badge>)}</div>
            </Card>
          </div>

          <Card className="p-6 bg-card/60 border-border">
            <h2 className="font-display text-lg font-semibold mb-4">AI Rewrite Suggestions</h2>
            <div className="space-y-4">
              {result.suggestions.map((s, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-card/40">
                  <Badge variant="outline" className="mb-2">{s.section}</Badge>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-destructive mb-1">Before</div>
                      <p className="text-muted-foreground line-through">{s.original}</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-success mb-1">After</div>
                      <p>{s.improved}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs italic text-muted-foreground border-l-2 border-accent/50 pl-3">{s.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
