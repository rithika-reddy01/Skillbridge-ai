
-- Pin search_path on remaining helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Revoke EXECUTE on internal definer functions; triggers/RLS still work because they bypass GRANTs
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is called inside RLS, but only by the planner; safe to keep grants for authed users (RLS uses it transparently)
-- Keep authenticated EXECUTE on has_role so RLS expressions still resolve

-- Replace the open contact policy with one that validates input shape
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit valid contact" ON public.contact_messages
  FOR INSERT WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND email LIKE '%_@_%._%'
    AND char_length(message) BETWEEN 1 AND 2000
  );
