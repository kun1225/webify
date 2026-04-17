-- Add role-based profiles and RLS rules for public.users.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'learner',
ADD CONSTRAINT users_role_check CHECK ("role" IN ('learner', 'creator', 'admin'));

ALTER TABLE public.users
ALTER COLUMN "role"
SET DEFAULT 'learner';

UPDATE public.users
SET
	"role" = 'learner'
WHERE
	"role" IS NULL;

ALTER TABLE public.users
ALTER COLUMN "role"
SET NOT NULL;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'users_id_auth_users_id_fkey'
			AND conrelid = 'public.users'::regclass
	) THEN
		ALTER TABLE public.users
		ADD CONSTRAINT users_id_auth_users_id_fkey
		FOREIGN KEY (id)
		REFERENCES auth.users (id)
		ON DELETE CASCADE;
	END IF;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users FOR
SELECT
	TO authenticated USING (
		(
			SELECT
				auth.uid ()
		) = id
	);

CREATE POLICY "Everyone can view creator profiles" ON public.users FOR
SELECT
	USING ("role" IN ('creator', 'admin'));

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE
	TO authenticated USING (
		(
			SELECT
				auth.uid ()
		) = id
	)
WITH
	CHECK (
		(
			SELECT
				auth.uid ()
		) = id
	);

REVOKE
UPDATE ON public.users
FROM
	anon,
	authenticated;

GRANT
SELECT
	ON public.users TO anon,
	authenticated;

GRANT
UPDATE (full_name) ON public.users TO authenticated;
