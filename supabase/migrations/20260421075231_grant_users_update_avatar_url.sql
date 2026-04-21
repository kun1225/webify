BEGIN;

INSERT INTO
	storage.buckets (id, name, public, allowed_mime_types)
VALUES
	(
		'avatars',
		'avatars',
		TRUE,
		ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
	)
ON CONFLICT (id) DO UPDATE
SET
	public = EXCLUDED.public,
	allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatars Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatars Public Read" ON storage.objects FOR
SELECT
	TO public USING (bucket_id = 'avatars');

CREATE POLICY "Users can insert their own avatar" ON storage.objects FOR INSERT TO authenticated
WITH
	CHECK (
		bucket_id = 'avatars'
		AND (storage.foldername (name)) [1] = auth.uid ()::text
	);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE
	TO authenticated USING (
		bucket_id = 'avatars'
		AND (storage.foldername (name)) [1] = auth.uid ()::text
	)
WITH
	CHECK (
		bucket_id = 'avatars'
		AND (storage.foldername (name)) [1] = auth.uid ()::text
	);

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO authenticated USING (
	bucket_id = 'avatars'
	AND (storage.foldername (name)) [1] = auth.uid ()::text
);

GRANT UPDATE (avatar_url) ON public.users TO authenticated;

COMMIT;
