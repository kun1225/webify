-- Function: create public.users row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET
	search_path = public;

-- Function: auto-update updated_at on public.users update
CREATE OR REPLACE FUNCTION public.handle_update_user () RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET
	search_path = public;

-- Trigger: after auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user ();

-- Trigger: before public.users update
DROP TRIGGER IF EXISTS on_user_updated ON public.users;

CREATE TRIGGER on_user_updated BEFORE
UPDATE ON public.users FOR EACH ROW
EXECUTE FUNCTION public.handle_update_user ();
