import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — SkillBridge AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", university: "", education: "", graduation_year: "", target_role: "", career_goals: "", bio: "" });
  const [skills, setSkills] = useState<Array<{ id: string; skill_name: string; level: number }>>([]);
  const [newSkill, setNewSkill] = useState("");
  const [interests, setInterests] = useState<Array<{ id: string; tag: string }>>([]);
  const [newInterest, setNewInterest] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: s }, { data: i }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_skills").select("*").eq("user_id", user.id),
        supabase.from("interests").select("*").eq("user_id", user.id),
      ]);
      if (p) setProfile({
        full_name: p.full_name ?? "", university: p.university ?? "", education: p.education ?? "",
        graduation_year: p.graduation_year?.toString() ?? "", target_role: p.target_role ?? "",
        career_goals: p.career_goals ?? "", bio: p.bio ?? "",
      });
      setSkills(s ?? []);
      setInterests(i ?? []);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, university: profile.university, education: profile.education,
      graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
      target_role: profile.target_role, career_goals: profile.career_goals, bio: profile.bio,
      onboarded: true,
    }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;
    const { data } = await supabase.from("user_skills").insert({ user_id: user.id, skill_name: newSkill.trim(), level: 3 }).select().single();
    if (data) setSkills([...skills, data]);
    setNewSkill("");
  };
  const removeSkill = async (id: string) => {
    await supabase.from("user_skills").delete().eq("id", id);
    setSkills(skills.filter((s) => s.id !== id));
  };
  const addInterest = async () => {
    if (!newInterest.trim() || !user) return;
    const { data } = await supabase.from("interests").insert({ user_id: user.id, tag: newInterest.trim() }).select().single();
    if (data) setInterests([...interests, data]);
    setNewInterest("");
  };
  const removeInterest = async (id: string) => {
    await supabase.from("interests").delete().eq("id", id);
    setInterests(interests.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">Your Profile</h1>

      <Card className="p-6 bg-card/60 border-border mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">Basics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <Field label="University" value={profile.university} onChange={(v) => setProfile({ ...profile, university: v })} />
          <Field label="Education / Major" value={profile.education} onChange={(v) => setProfile({ ...profile, education: v })} />
          <Field label="Graduation year" value={profile.graduation_year} onChange={(v) => setProfile({ ...profile, graduation_year: v })} type="number" />
          <Field label="Target role" value={profile.target_role} onChange={(v) => setProfile({ ...profile, target_role: v })} placeholder="e.g. Frontend Engineer" />
        </div>
        <div className="mt-4">
          <Label>Career goals</Label>
          <Textarea className="mt-1.5" rows={3} value={profile.career_goals} onChange={(e) => setProfile({ ...profile, career_goals: e.target.value })} placeholder="What are you trying to achieve?" />
        </div>
        <div className="mt-4">
          <Label>Bio</Label>
          <Textarea className="mt-1.5" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="A short intro about you." />
        </div>
        <Button onClick={save} disabled={busy} className="mt-5 bg-gradient-brand text-primary-foreground border-0">
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </Card>

      <Card className="p-6 bg-card/60 border-border mb-6">
        <h2 className="font-display text-lg font-semibold mb-2">Skills</h2>
        <p className="text-sm text-muted-foreground mb-4">These power your career & roadmap recommendations.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((s) => (
            <Badge key={s.id} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
              {s.skill_name}
              <button onClick={() => removeSkill(s.id)} className="hover:text-destructive ml-1"><X className="size-3" /></button>
            </Badge>
          ))}
          {skills.length === 0 && <span className="text-sm text-muted-foreground">No skills yet — add some below.</span>}
        </div>
        <div className="flex gap-2">
          <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="e.g. React" />
          <Button onClick={addSkill} variant="outline"><Plus className="size-4 mr-1" />Add</Button>
        </div>
      </Card>

      <Card className="p-6 bg-card/60 border-border">
        <h2 className="font-display text-lg font-semibold mb-4">Interests</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.map((i) => (
            <Badge key={i.id} className="pl-3 pr-1 py-1.5 gap-1 bg-accent/15 text-accent border-accent/30">
              {i.tag}
              <button onClick={() => removeInterest(i.id)} className="hover:text-destructive ml-1"><X className="size-3" /></button>
            </Badge>
          ))}
          {interests.length === 0 && <span className="text-sm text-muted-foreground">e.g. design, AI, gaming, climate</span>}
        </div>
        <div className="flex gap-2">
          <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())} placeholder="e.g. design" />
          <Button onClick={addInterest} variant="outline"><Plus className="size-4 mr-1" />Add</Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
