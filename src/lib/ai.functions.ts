import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(opts: {
  system: string;
  user: string;
  expectJson?: boolean;
}): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI service unavailable (missing key)");
  const body: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  };
  if (opts.expectJson) body.response_format = { type: "json_object" };
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace.");
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const arrStart = cleaned.indexOf("[");
  const idx = arrStart >= 0 && (start < 0 || arrStart < start) ? arrStart : start;
  return JSON.parse(idx >= 0 ? cleaned.slice(idx) : cleaned) as T;
}

// ============ Career Recommendations ============
export const recommendCareers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      skills: z.array(z.string()).default([]),
      interests: z.array(z.string()).default([]),
      goals: z.string().default(""),
      education: z.string().default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sys =
      "You are an expert career counselor. Return ONLY valid JSON. Schema: {\"careers\":[{\"role\":string,\"confidence\":number(0-100),\"demand\":\"low\"|\"medium\"|\"high\",\"salary_min\":number(USD),\"salary_max\":number(USD),\"required_skills\":string[],\"description\":string,\"reasoning\":string}]}. Provide 5 diverse careers ranked by fit.";
    const userMsg = `Student profile:\nSkills: ${data.skills.join(", ") || "none specified"}\nInterests: ${data.interests.join(", ") || "none specified"}\nGoals: ${data.goals || "exploring"}\nEducation: ${data.education || "undergraduate"}`;
    const raw = await callAI({ system: sys, user: userMsg, expectJson: true });
    const parsed = parseJson<{ careers: Array<{ role: string; confidence: number; demand: string; salary_min: number; salary_max: number; required_skills: string[]; description: string; reasoning: string }> }>(raw);

    await supabase.from("career_recommendations").delete().eq("user_id", userId);
    if (parsed.careers?.length) {
      await supabase.from("career_recommendations").insert(
        parsed.careers.map((c) => ({
          user_id: userId,
          role: c.role,
          confidence: c.confidence,
          demand: c.demand,
          salary_min: c.salary_min,
          salary_max: c.salary_max,
          required_skills: c.required_skills,
          description: c.description,
          reasoning: c.reasoning,
        })),
      );
    }
    await supabase.from("ai_logs").insert({ user_id: userId, feature: "recommendCareers", model: MODEL, success: true });
    return { careers: parsed.careers };
  });

// ============ Skill Gap ============
export const analyzeSkillGap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ targetRole: z.string().min(1), currentSkills: z.array(z.string()).default([]) }))
  .handler(async ({ data }) => {
    const sys = 'Return ONLY JSON: {"required":[{"skill":string,"priority":"high"|"medium"|"low","weeks_to_learn":number,"reason":string}],"strengths":string[]}';
    const userMsg = `Target role: ${data.targetRole}\nCurrent skills: ${data.currentSkills.join(", ") || "beginner"}\nList 8 most-impactful missing skills, plus strengths.`;
    const raw = await callAI({ system: sys, user: userMsg, expectJson: true });
    return parseJson<{ required: Array<{ skill: string; priority: string; weeks_to_learn: number; reason: string }>; strengths: string[] }>(raw);
  });

// ============ Roadmap ============
export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ targetRole: z.string().min(1), level: z.string().default("beginner") }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sys = 'Return ONLY JSON: {"phases":[{"id":string,"title":string,"weeks":number,"description":string,"skills":string[],"resources":[{"title":string,"url":string,"type":"video"|"course"|"article"|"project"}]}],"estimated_weeks":number}. Produce a sequential 6-8 phase roadmap from current level to job-ready.';
    const userMsg = `Target role: ${data.targetRole}\nStarting level: ${data.level}`;
    const raw = await callAI({ system: sys, user: userMsg, expectJson: true });
    const parsed = parseJson<{ phases: Array<{ id: string; title: string; weeks: number; description: string; skills: string[]; resources: Array<{ title: string; url: string; type: string }> }>; estimated_weeks: number }>(raw);

    const nodes = parsed.phases.map((p, i) => ({ id: p.id || `n${i}`, position: { x: 100 + (i % 3) * 280, y: 80 + Math.floor(i / 3) * 200 }, data: { label: p.title, weeks: p.weeks, description: p.description, skills: p.skills, resources: p.resources }, type: "default" }));
    const edges = parsed.phases.slice(0, -1).map((p, i) => ({ id: `e${i}`, source: p.id || `n${i}`, target: parsed.phases[i + 1].id || `n${i + 1}` }));

    await supabase.from("roadmaps").insert({ user_id: userId, target_role: data.targetRole, nodes, edges, estimated_weeks: parsed.estimated_weeks });
    return { phases: parsed.phases, estimated_weeks: parsed.estimated_weeks };
  });

// ============ Resume Analyzer ============
export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ resumeText: z.string().min(50), targetRole: z.string().default("Software Engineer") }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sys = 'You are an expert ATS resume reviewer. Return ONLY JSON: {"ats_score":number(0-100),"formatting_score":number(0-100),"keywords_found":string[],"keywords_missing":string[],"suggestions":[{"section":string,"original":string,"improved":string,"reason":string}],"summary":string}';
    const userMsg = `Target role: ${data.targetRole}\n\nResume:\n${data.resumeText.slice(0, 6000)}`;
    const raw = await callAI({ system: sys, user: userMsg, expectJson: true });
    const parsed = parseJson<{ ats_score: number; formatting_score: number; keywords_found: string[]; keywords_missing: string[]; suggestions: Array<{ section: string; original: string; improved: string; reason: string }>; summary: string }>(raw);

    await supabase.from("resumes").insert({
      user_id: userId, raw_text: data.resumeText, target_role: data.targetRole,
      ats_score: parsed.ats_score, formatting_score: parsed.formatting_score,
      keywords_found: parsed.keywords_found, keywords_missing: parsed.keywords_missing, suggestions: parsed.suggestions,
    });
    return parsed;
  });

// ============ Resume Rewriter (full rewrite for export) ============
export const rewriteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ resumeText: z.string().min(50), targetRole: z.string().default("Software Engineer") }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const sys =
      'You are an elite resume writer. Rewrite the candidate\'s resume to be ATS-optimized for the target role. Return ONLY JSON: {"name":string,"headline":string,"contact":{"email":string,"phone":string,"location":string,"links":string[]},"summary":string,"skills":string[],"experience":[{"company":string,"role":string,"location":string,"start":string,"end":string,"bullets":string[]}],"projects":[{"name":string,"summary":string,"bullets":string[]}],"education":[{"school":string,"degree":string,"start":string,"end":string,"details":string}],"certifications":string[]}. Use punchy quantified bullets. Pull info ONLY from the source resume — do not invent facts. If a field is missing, leave the string empty or array empty.';
    const userMsg = `Target role: ${data.targetRole}\n\nOriginal resume:\n${data.resumeText.slice(0, 8000)}`;
    const raw = await callAI({ system: sys, user: userMsg, expectJson: true });
    const parsed = parseJson<ResumeDoc>(raw);
    await supabase.from("ai_logs").insert({ user_id: userId, feature: "rewriteResume", model: MODEL, success: true });
    return parsed;
  });

export type ResumeDoc = {
  name: string;
  headline: string;
  contact: { email: string; phone: string; location: string; links: string[] };
  summary: string;
  skills: string[];
  experience: Array<{ company: string; role: string; location: string; start: string; end: string; bullets: string[] }>;
  projects: Array<{ name: string; summary: string; bullets: string[] }>;
  education: Array<{ school: string; degree: string; start: string; end: string; details: string }>;
  certifications: string[];
};

// ============ Mentor Chat ============
export const mentorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      threadId: z.string().optional(),
      message: z.string().min(1).max(4000),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let threadId = data.threadId;
    if (!threadId) {
      const { data: t } = await supabase
        .from("chat_threads")
        .insert({ user_id: userId, title: data.message.slice(0, 60) })
        .select("id")
        .single();
      threadId = t!.id;
    }

    await supabase.from("chat_messages").insert({ thread_id: threadId, user_id: userId, role: "user", content: data.message });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(30);

    const sys = "You are an empathetic, sharp AI career mentor for students. Be concise, specific, and actionable. Use markdown. Ask clarifying questions when needed. Cover career direction, skill-building, interview prep, resume tips, and motivation.";
    const apiKey = process.env.LOVABLE_API_KEY!;
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: sys },
          ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "";

    await supabase.from("chat_messages").insert({ thread_id: threadId, user_id: userId, role: "assistant", content: reply });
    await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
    return { threadId, reply };
  });
