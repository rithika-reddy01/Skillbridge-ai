import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeResume, rewriteResume, type ResumeDoc } from "@/lib/ai.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Sparkles, CheckCircle2, XCircle, Download, FileDown, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/resume")({
  head: () => ({ meta: [{ title: "ATS Resume Builder — SkillBridge AI" }] }),
  component: ResumePage,
});

type Analysis = {
  ats_score: number; formatting_score: number;
  keywords_found: string[]; keywords_missing: string[];
  suggestions: Array<{ section: string; original: string; improved: string; reason: string }>;
  summary: string;
};

function ResumePage() {
  const analyzeFn = useServerFn(analyzeResume);
  const rewriteFn = useServerFn(rewriteResume);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [tab, setTab] = useState("input");
  const [analyzing, setAnalyzing] = useState(false);
  const [building, setBuilding] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [doc, setDoc] = useState<ResumeDoc | null>(null);

  const onFile = async (f: File) => {
    setFileName(f.name);
    const ext = f.name.toLowerCase().split(".").pop();
    try {
      if (ext === "docx") {
        const mammoth = await import("mammoth");
        const buf = await f.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
        setText(value);
      } else if (ext === "pdf") {
        toast.error("PDFs aren't supported — paste the text or upload .docx/.txt");
        return;
      } else {
        setText(await f.text());
      }
      toast.success(`Loaded ${f.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read file");
    }
  };

  const analyze = async () => {
    if (text.length < 50) return toast.error("Paste or upload your resume first (at least a snippet).");
    setAnalyzing(true);
    try {
      const r = await analyzeFn({ data: { resumeText: text, targetRole: role } });
      setAnalysis(r);
      setTab("analysis");
      toast.success("Analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setAnalyzing(false); }
  };

  const build = async () => {
    if (text.length < 50) return toast.error("Need a resume to optimize");
    setBuilding(true);
    try {
      const r = await rewriteFn({ data: { resumeText: text, targetRole: role } });
      setDoc(r);
      setTab("preview");
      toast.success("Optimized resume ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBuilding(false); }
  };

  const scoreColor = (s: number) => s >= 80 ? "text-success" : s >= 60 ? "text-warning" : "text-destructive";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-2">
          <FileText className="size-3.5" /> Premium ATS Resume Builder
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Resume <span className="text-gradient">ATS Studio</span>
        </h1>
        <p className="text-muted-foreground mt-1">Upload, analyze, rewrite, preview, and export — all in one place.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="input"><Upload className="size-3.5 mr-1.5" /> Input</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysis}><Sparkles className="size-3.5 mr-1.5" /> Analysis</TabsTrigger>
          <TabsTrigger value="preview" disabled={!doc}><Wand2 className="size-3.5 mr-1.5" /> Optimized</TabsTrigger>
          <TabsTrigger value="export" disabled={!doc}><Download className="size-3.5 mr-1.5" /> Export</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card className="p-6 bg-card/60 border-border">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <Label>Target role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Upload .docx or .txt</Label>
                <Input type="file" accept=".txt,.md,.docx" className="mt-1.5" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              </div>
            </div>
            <Label>Resume text {fileName && <span className="text-muted-foreground text-xs ml-2">{fileName} · {text.length.toLocaleString()} chars</span>}</Label>
            <Textarea rows={14} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your full resume text here…" className="mt-1.5 font-mono text-xs" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={analyze} disabled={analyzing} className="bg-gradient-brand text-primary-foreground border-0">
                <Sparkles className="size-4 mr-2" />{analyzing ? "Scoring…" : "Analyze (ATS score)"}
              </Button>
              <Button onClick={build} disabled={building} variant="outline">
                <Wand2 className="size-4 mr-2" />{building ? "Rewriting…" : "AI rewrite & build"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {analysis && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 bg-card/60 border-border">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">ATS Score</div>
                  <div className={`mt-2 font-display text-6xl font-semibold ${scoreColor(analysis.ats_score)}`}>{analysis.ats_score}</div>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-brand transition-all" style={{ width: `${analysis.ats_score}%` }} />
                  </div>
                </Card>
                <Card className="p-6 bg-card/60 border-border">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Formatting</div>
                  <div className={`mt-2 font-display text-6xl font-semibold ${scoreColor(analysis.formatting_score)}`}>{analysis.formatting_score}</div>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-accent transition-all" style={{ width: `${analysis.formatting_score}%` }} />
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-card/60 border-border">
                <div className="flex items-start gap-3">
                  <FileText className="size-5 text-accent mt-1" />
                  <div>
                    <h2 className="font-display text-lg font-semibold">Summary</h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{analysis.summary}</p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 bg-card/60 border-border">
                  <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="size-4 text-success" /><h3 className="font-display font-semibold">Keywords found</h3></div>
                  <div className="flex flex-wrap gap-1.5">{analysis.keywords_found.map((k) => <Badge key={k} className="bg-success/15 text-success border-success/30">{k}</Badge>)}</div>
                </Card>
                <Card className="p-6 bg-card/60 border-border">
                  <div className="flex items-center gap-2 mb-3"><XCircle className="size-4 text-destructive" /><h3 className="font-display font-semibold">Keywords missing</h3></div>
                  <div className="flex flex-wrap gap-1.5">{analysis.keywords_missing.map((k) => <Badge key={k} className="bg-destructive/15 text-destructive border-destructive/30">{k}</Badge>)}</div>
                </Card>
              </div>

              <Card className="p-6 bg-card/60 border-border">
                <h2 className="font-display text-lg font-semibold mb-4">AI Rewrite Suggestions</h2>
                <div className="space-y-4">
                  {analysis.suggestions.map((s, i) => (
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
                <div className="mt-6">
                  <Button onClick={build} disabled={building} className="bg-gradient-brand text-primary-foreground border-0">
                    <Wand2 className="size-4 mr-2" />{building ? "Building…" : "Apply all & build optimized resume"}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview">{doc && <ResumePreview doc={doc} onExport={() => setTab("export")} />}</TabsContent>
        <TabsContent value="export">{doc && <ResumeExport doc={doc} />}</TabsContent>
      </Tabs>
    </div>
  );
}

function ResumePreview({ doc, onExport }: { doc: ResumeDoc; onExport: () => void }) {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card/60 border-border flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-muted-foreground">Live preview of your AI-rewritten, ATS-optimized resume.</div>
        <Button onClick={onExport} className="bg-gradient-brand text-primary-foreground border-0">
          <Download className="size-4 mr-2" /> Go to export
        </Button>
      </Card>
      <ResumeRendered doc={doc} />
    </div>
  );
}

function ResumeRendered({ doc, innerRef }: { doc: ResumeDoc; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={innerRef} className="mx-auto bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden" style={{ maxWidth: "8.5in" }}>
      <div className="p-10 font-sans" style={{ minHeight: "11in" }}>
        <header className="border-b-2 border-slate-900 pb-4 mb-5">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">{doc.name || "Your Name"}</h1>
          {doc.headline && <p className="text-slate-700 mt-1">{doc.headline}</p>}
          <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
            {doc.contact?.email && <span>{doc.contact.email}</span>}
            {doc.contact?.phone && <span>· {doc.contact.phone}</span>}
            {doc.contact?.location && <span>· {doc.contact.location}</span>}
            {doc.contact?.links?.map((l) => <span key={l}>· {l}</span>)}
          </div>
        </header>

        {doc.summary && (
          <Section title="Summary">
            <p className="text-sm leading-relaxed">{doc.summary}</p>
          </Section>
        )}

        {doc.skills?.length > 0 && (
          <Section title="Core Skills">
            <p className="text-sm">{doc.skills.join(" · ")}</p>
          </Section>
        )}

        {doc.experience?.length > 0 && (
          <Section title="Experience">
            <div className="space-y-4">
              {doc.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline flex-wrap gap-2">
                    <div>
                      <div className="font-semibold">{e.role} <span className="font-normal text-slate-600">· {e.company}</span></div>
                      {e.location && <div className="text-xs text-slate-600">{e.location}</div>}
                    </div>
                    <div className="text-xs text-slate-600">{e.start} – {e.end}</div>
                  </div>
                  <ul className="mt-1.5 list-disc pl-5 text-sm space-y-1">
                    {e.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {doc.projects?.length > 0 && (
          <Section title="Projects">
            <div className="space-y-3">
              {doc.projects.map((p, i) => (
                <div key={i}>
                  <div className="font-semibold">{p.name}</div>
                  {p.summary && <div className="text-sm text-slate-700">{p.summary}</div>}
                  {p.bullets?.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
                      {p.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {doc.education?.length > 0 && (
          <Section title="Education">
            <div className="space-y-2">
              {doc.education.map((e, i) => (
                <div key={i} className="flex justify-between items-baseline flex-wrap gap-2">
                  <div>
                    <div className="font-semibold">{e.school}</div>
                    <div className="text-sm text-slate-700">{e.degree} {e.details && `· ${e.details}`}</div>
                  </div>
                  <div className="text-xs text-slate-600">{e.start} – {e.end}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {doc.certifications?.length > 0 && (
          <Section title="Certifications">
            <p className="text-sm">{doc.certifications.join(" · ")}</p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="font-display text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">{title}</h2>
      {children}
    </section>
  );
}

function ResumeExport({ doc }: { doc: ResumeDoc }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);

  const exportPdf = async () => {
    if (!ref.current) return;
    setBusy("pdf");
    try {
      const mod = await import("html2pdf.js");
      const html2pdf = (mod as unknown as { default: (...a: unknown[]) => { set: (o: object) => { from: (el: Element) => { save: () => Promise<void> } } } }).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `${(doc.name || "resume").replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(ref.current)
        .save();
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    } finally { setBusy(null); }
  };

  const exportDocx = async () => {
    setBusy("docx");
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
      const fileSaver = await import("file-saver");
      const saveAs = (fileSaver as unknown as { saveAs: (b: Blob, n: string) => void }).saveAs;

      const p = (text: string, opts: { bold?: boolean; size?: number } = {}) =>
        new Paragraph({ children: [new TextRun({ text, bold: opts.bold, size: opts.size })] });
      const heading = (t: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t.toUpperCase(), bold: true })] });

      const children: InstanceType<typeof Paragraph>[] = [];
      children.push(new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: doc.name || "Your Name", bold: true, size: 36 })] }));
      if (doc.headline) children.push(p(doc.headline));
      const contactLine = [doc.contact?.email, doc.contact?.phone, doc.contact?.location, ...(doc.contact?.links ?? [])].filter(Boolean).join(" · ");
      if (contactLine) children.push(p(contactLine, { size: 20 }));

      if (doc.summary) { children.push(heading("Summary")); children.push(p(doc.summary)); }
      if (doc.skills?.length) { children.push(heading("Core Skills")); children.push(p(doc.skills.join(" · "))); }

      if (doc.experience?.length) {
        children.push(heading("Experience"));
        for (const e of doc.experience) {
          children.push(p(`${e.role} — ${e.company}${e.location ? ` (${e.location})` : ""}`, { bold: true }));
          children.push(p(`${e.start} – ${e.end}`, { size: 18 }));
          for (const b of e.bullets ?? []) children.push(new Paragraph({ text: `• ${b}` }));
        }
      }

      if (doc.projects?.length) {
        children.push(heading("Projects"));
        for (const pr of doc.projects) {
          children.push(p(pr.name, { bold: true }));
          if (pr.summary) children.push(p(pr.summary));
          for (const b of pr.bullets ?? []) children.push(new Paragraph({ text: `• ${b}` }));
        }
      }

      if (doc.education?.length) {
        children.push(heading("Education"));
        for (const e of doc.education) {
          children.push(p(`${e.school} — ${e.degree}`, { bold: true }));
          children.push(p(`${e.start} – ${e.end}${e.details ? ` · ${e.details}` : ""}`, { size: 18 }));
        }
      }

      if (doc.certifications?.length) { children.push(heading("Certifications")); children.push(p(doc.certifications.join(" · "))); }

      const docx = new Document({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(docx);
      saveAs(blob, `${(doc.name || "resume").replace(/\s+/g, "_")}.docx`);
      toast.success("DOCX downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "DOCX export failed");
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-card/60 border-border">
        <h3 className="font-display text-lg font-semibold mb-2">Download your resume</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose your preferred format. Both are ATS-friendly.</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportPdf} disabled={busy !== null} className="bg-gradient-brand text-primary-foreground border-0">
            <FileDown className="size-4 mr-2" />{busy === "pdf" ? "Rendering…" : "Download PDF"}
          </Button>
          <Button onClick={exportDocx} disabled={busy !== null} variant="outline">
            <FileDown className="size-4 mr-2" />{busy === "docx" ? "Building…" : "Download DOCX"}
          </Button>
        </div>
      </Card>
      <ResumeRendered doc={doc} innerRef={ref} />
    </div>
  );
}
