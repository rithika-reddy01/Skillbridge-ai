import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicFooter, PublicHeader } from "@/components/site/PublicHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MessageSquare, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SkillBridge AI" },
      { name: "description", content: "Get in touch with the SkillBridge AI team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({ name, email, message });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent! We'll get back to you soon.");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <section className="relative px-6 pt-24 pb-12">
        <div className="aurora" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight">
            Let's <span className="text-gradient">talk</span>.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Questions, feedback, partnerships — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card className="p-5 bg-card/60 border-border">
              <Mail className="size-5 text-accent mb-3" />
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">hello@skillbridge.ai</div>
            </Card>
            <Card className="p-5 bg-card/60 border-border">
              <MessageSquare className="size-5 text-accent mb-3" />
              <div className="font-medium">Response time</div>
              <div className="text-sm text-muted-foreground">Usually within 24 hours.</div>
            </Card>
          </div>
          <Card className="p-8 bg-card/60 border-border md:col-span-2">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required className="mt-1.5" />
              </div>
              <Button type="submit" disabled={busy} className="bg-gradient-brand text-primary-foreground border-0">
                {busy ? "Sending…" : <>Send message <Send className="ml-1 size-4" /></>}
              </Button>
            </form>
          </Card>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
