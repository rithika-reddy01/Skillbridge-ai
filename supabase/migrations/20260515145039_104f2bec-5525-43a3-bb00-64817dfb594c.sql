
-- =========== ENUMS ===========
CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TYPE public.job_level AS ENUM ('internship', 'entry', 'junior', 'mid');
CREATE TYPE public.application_status AS ENUM ('saved', 'applied', 'interview', 'offer', 'rejected');
CREATE TYPE public.resource_type AS ENUM ('course', 'video', 'article', 'book', 'project', 'certification');
CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- =========== PROFILES ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  bio TEXT,
  education TEXT,
  university TEXT,
  graduation_year INTEGER,
  target_role TEXT,
  career_goals TEXT,
  readiness_score INTEGER NOT NULL DEFAULT 0,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========== USER ROLES ===========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========== SKILLS ===========
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag)
);
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- =========== CAREER RECOMMENDATIONS ===========
CREATE TABLE public.career_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  description TEXT,
  confidence INTEGER NOT NULL DEFAULT 0,
  demand TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

-- =========== ROADMAPS ===========
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_weeks INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- =========== RESOURCES ===========
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  provider TEXT,
  type public.resource_type NOT NULL DEFAULT 'course',
  level public.skill_level NOT NULL DEFAULT 'beginner',
  skill_tag TEXT,
  description TEXT,
  is_free BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- =========== RESUMES ===========
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  raw_text TEXT NOT NULL,
  ats_score INTEGER,
  formatting_score INTEGER,
  keywords_found JSONB DEFAULT '[]'::jsonb,
  keywords_missing JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  improved_text TEXT,
  target_role TEXT,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- =========== JOBS ===========
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN NOT NULL DEFAULT false,
  level public.job_level NOT NULL DEFAULT 'internship',
  industry TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  apply_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- =========== CHAT ===========
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =========== AI LOGS ===========
CREATE TABLE public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feature TEXT NOT NULL,
  model TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- =========== CONTACT ===========
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =========== RLS POLICIES ===========

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles (read-only for users; admin manages via service role)
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- skills (public read, admin write)
CREATE POLICY "Anyone authenticated views skills" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_skills
CREATE POLICY "Users manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all user skills" ON public.user_skills FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- interests
CREATE POLICY "Users manage own interests" ON public.interests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- career_recommendations
CREATE POLICY "Users manage own recs" ON public.career_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- roadmaps
CREATE POLICY "Users manage own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- resources (public read, admin write)
CREATE POLICY "Anyone authenticated views resources" ON public.resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- resumes
CREATE POLICY "Users manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all resumes" ON public.resumes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- jobs (public read for authed users, admin write)
CREATE POLICY "Anyone authenticated views jobs" ON public.jobs FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- saved_jobs
CREATE POLICY "Users manage own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- applications
CREATE POLICY "Users manage own applications" ON public.applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all applications" ON public.applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- chat
CREATE POLICY "Users manage own threads" ON public.chat_threads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON public.chat_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_logs
CREATE POLICY "Users view own logs" ON public.ai_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own logs" ON public.ai_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all logs" ON public.ai_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- contact (anyone can submit; admins can read)
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =========== TRIGGERS ===========

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER threads_touch BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========== INDEXES ===========
CREATE INDEX idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX idx_jobs_active ON public.jobs(active, posted_at DESC);
CREATE INDEX idx_jobs_level ON public.jobs(level);
CREATE INDEX idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX idx_applications_user ON public.applications(user_id);
CREATE INDEX idx_chat_messages_thread ON public.chat_messages(thread_id, created_at);
CREATE INDEX idx_chat_threads_user ON public.chat_threads(user_id, updated_at DESC);
