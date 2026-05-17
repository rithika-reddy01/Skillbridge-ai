# SkillBridge AI — Build Plan

An AI-powered career platform for students: career discovery, skill-gap analysis, personalized roadmaps, resume ATS review, internship feed, and a 24/7 AI mentor.

## Scope

Full spec in one pass. Mock job dataset (no external job API keys needed). Auth: Email+password, Google, GitHub.

## Pages & Routes

Public
- `/` Landing — hero, value prop, animated stats, features grid, roadmap preview, dashboard preview, footer
- `/about` — mission, problem, solution, impact, team
- `/features` — deep dive on each capability
- `/contact` — form (saved to DB + email via Resend if enabled)
- `/login`, `/signup`, `/forgot-password`, `/reset-password`

Authenticated (`_authenticated` layout)
- `/dashboard` — overview: readiness score, next actions, progress widgets
- `/dashboard/profile` — skills, interests, goals, education, resume upload
- `/dashboard/careers` — AI career recommendations with confidence, demand, salary
- `/dashboard/skills` — skill-gap analyzer vs target role
- `/dashboard/roadmap` — visual mindmap roadmap with curated resources
- `/dashboard/resume` — ATS analyzer + AI suggestions + improved download
- `/dashboard/jobs` — internship/job board with filters, save, apply tracker
- `/dashboard/mentor` — AI chatbot (threaded, DB-persisted)
- `/dashboard/progress` — milestones, completions, applications

Admin (`_authenticated/_admin`, role-gated)
- `/admin` — metrics dashboard
- `/admin/users` — user management
- `/admin/jobs` — job listings moderation
- `/admin/resources` — learning resources CRUD
- `/admin/logs` — AI usage logs

## Tech & Architecture

- TanStack Start (existing template), React 19, Tailwind v4, shadcn/ui, Framer Motion
- Lovable Cloud (Postgres + Auth + Storage) for backend, RLS everywhere
- Lovable AI Gateway (`google/gemini-3-flash-preview` default) via AI SDK
- Server functions (`createServerFn`) for AI calls, recommendations, ATS, roadmap gen
- AI Elements for the mentor chat UI (threaded, DB-persisted)
- Recharts for data viz; React Flow for roadmap mindmap

## Database Schema (Lovable Cloud)

- `profiles` — id (FK auth.users), full_name, avatar_url, education, bio, target_role, readiness_score
- `user_roles` — (user_id, role: 'admin'|'student') with `has_role()` SECURITY DEFINER
- `skills` — catalog (name, category)
- `user_skills` — user_id, skill_id, level (1–5)
- `interests` — user_id, tag
- `career_recommendations` — user_id, role, confidence, demand, salary_min, salary_max, required_skills (jsonb), generated_at
- `roadmaps` — user_id, target_role, nodes (jsonb), edges (jsonb), generated_at
- `resources` — title, url, provider, type, level, skill_id
- `resumes` — user_id, file_path, parsed_text, ats_score, suggestions (jsonb)
- `jobs` — title, company, location, remote, level, salary, skills (jsonb), description, source
- `saved_jobs` — user_id, job_id
- `applications` — user_id, job_id, status, applied_at, notes
- `chat_threads` — id, user_id, title, updated_at
- `chat_messages` — id, thread_id, role, parts (jsonb), created_at
- `ai_logs` — user_id, feature, model, tokens, created_at
- `contact_messages` — name, email, message, created_at
- Storage buckets: `resumes` (private), `avatars` (public)

All tables RLS-enabled. Admin policies via `has_role(auth.uid(),'admin')`.

## AI Features (server functions)

- `recommendCareers` — input profile → structured array of careers with scores
- `analyzeSkillGap` — input current skills + target role → missing/priority skills
- `generateRoadmap` — input target role + level → nodes/edges JSON for React Flow
- `analyzeResume` — input parsed text → ATS score, missing keywords, rewrite suggestions
- `generateCoverLetter` — job + profile → cover letter
- `mentorChat` — streaming chat with system prompt + tool calls (lookup resources, suggest roadmap)

## Auth

- Email/password, Google, and GitHub via Lovable Cloud Auth
- Note: GitHub provider requires enabling in the Cloud auth settings; I'll wire the UI and call `configure_social_auth` for google; GitHub needs the Supabase integration to be connected — I'll surface that requirement in the UI if not configured
- `_authenticated` layout guards dashboard, `_admin` guards admin
- On signup, trigger creates `profiles` row + default `student` role

## Design

I'll generate 3 distinct hackathon-grade design directions next; you pick one and I'll build the entire app against it. Tokens go into `src/styles.css`; semantic only — no hard-coded colors in components.

## Job Data

Seed 60–100 realistic internship/entry-level roles across SWE, Data, Design, Marketing, Product. Filters: location, remote, level, skill, salary.

## Deliverables

- All routes above, fully wired
- DB migrations + RLS + seed data
- Server functions for every AI feature
- Admin panel with role-gated access
- README with env var list and deploy notes (auto-published via Lovable)

## Out of Scope (v1)

- Real external job APIs (mock dataset instead)
- Payments/Pricing checkout (UI teaser only)
- Mobile native apps

## Dependencies to add

`bun add html2pdf.js docx file-saver mammoth pdfjs-dist` (+ `@types/file-saver` dev)

## Database

Optional micro-migration for `roadmap_progress (user_id, node_id, completed_at)` with RLS — only if we wire the progress checkbox. Will confirm before running.

## Design / UX

- Reuse existing tokens (`bg-gradient-brand`, `glass`, `aurora`, `glow-ring`) — no new colors.
- Mobile: tabs collapse to accordion on `<sm`; mindmap falls back to the timeline view on small viewports.
- Motion: framer-motion fades + score-ring count-up.

## Out of scope

- No payments, no real PDF parsing on server (kept client-side to avoid Worker native-binary limits).
- No changes to auth, admin, or other dashboard pages.
