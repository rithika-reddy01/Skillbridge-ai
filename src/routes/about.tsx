import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PublicFooter, PublicHeader } from "@/components/site/PublicHeader";
import { Card } from "@/components/ui/card";
import { Target, Sparkles, Globe, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SkillBridge AI" },
      { name: "description", content: "We're building the AI-native career coach every student deserves." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="relative px-6 pt-24 pb-16">
        <div className="aurora" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-6xl font-semibold tracking-tight">
            We're closing the <span className="text-gradient">opportunity gap</span>.
          </motion.h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Most students don't lack ambition — they lack a map. SkillBridge AI is a personal career
            coach in your pocket, built on frontier AI, designed for the next generation of builders.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6">
          {[
            { icon: Target, title: "Our mission", body: "Make world-class career guidance free and accessible to every student on earth — regardless of school, geography, or network." },
            { icon: Sparkles, title: "What makes us different", body: "We don't just recommend — we explain. Every career match, every roadmap, every resume edit comes with transparent AI reasoning." },
            { icon: Globe, title: "Built for everyone", body: "From CS majors in IIT to design students in Lagos, SkillBridge supports careers across tech, design, product, data, and creative fields." },
            { icon: Heart, title: "Student-first, always", body: "Free core. Private by default. No selling your data. Just a tool that genuinely roots for you." },
          ].map((c) => (
            <Card key={c.title} className="p-6 bg-card/60 border-border">
              <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center mb-4">
                <c.icon className="size-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">{c.title}</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Built by students, for students.
          </h2>
          <p className="mt-4 text-muted-foreground">
            SkillBridge AI was born out of a hackathon weekend, fueled by the belief that AI should
            level the playing field — not widen the gap.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
