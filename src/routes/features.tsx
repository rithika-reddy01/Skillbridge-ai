import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/site/PublicHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Compass, GitBranch, FileText, Briefcase, MessageCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — SkillBridge AI" },
      { name: "description", content: "AI career discovery, skill gap analysis, personalized roadmaps, resume ATS, internship matching, 24/7 mentor." },
    ],
  }),
  component: FeaturesPage,
});

const ITEMS = [
  { icon: Brain, title: "AI Career Discovery", body: "Tell us your skills, interests, and goals. We map you to careers with confidence scores, demand signals, and salary bands — all explained transparently." },
  { icon: Compass, title: "Skill Gap Analyzer", body: "Pick a target role. Get a prioritized list of skills you're missing, ranked by impact, with time estimates." },
  { icon: GitBranch, title: "Personalized Roadmaps", body: "Auto-generated step-by-step learning roadmaps. Visualized as a mindmap, packed with curated free + paid resources." },
  { icon: FileText, title: "Resume ATS Intelligence", body: "Upload or paste your resume. Get an ATS-style score, missing keywords, formatting feedback, and rewritten bullets." },
  { icon: Briefcase, title: "Smart Internship Matching", body: "Curated internships and entry-level roles, filtered by your skill profile, location, and remote preference." },
  { icon: MessageCircle, title: "24/7 AI Mentor", body: "Threaded chat with an AI mentor trained for career conversations — interview prep, learning advice, life decisions." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="relative px-6 pt-24 pb-12">
        <div className="aurora" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight">
            Six AI superpowers. <span className="text-gradient">One workspace.</span>
          </h1>
          <p className="mt-6 text-muted-foreground text-lg">
            Everything you need to go from confused to hired — without the chaos of 10 different tools.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-6">
          {ITEMS.map((it) => (
            <Card key={it.title} className="p-8 bg-card/60 border-border">
              <div className="size-12 rounded-xl bg-gradient-brand grid place-items-center mb-5">
                <it.icon className="size-6 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold">{it.title}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{it.body}</p>
            </Card>
          ))}
        </div>
        <div className="mx-auto max-w-2xl mt-16 text-center">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-brand text-primary-foreground border-0 h-12 px-8">
              Try it free <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
