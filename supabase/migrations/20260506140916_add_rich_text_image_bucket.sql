INSERT INTO
	storage.buckets (id, name, public, allowed_mime_types)
VALUES
	(
		'rich-text-images',
		'rich-text-images',
		TRUE,
		ARRAY[
			'image/png',
			'image/jpeg',
			'image/jpg',
			'image/webp'
		]
	)
ON CONFLICT (id) DO UPDATE -- if the bucket already exists, then update it
SET
	public = excluded.public,
	allowed_mime_types = excluded.allowed_mime_types;

-- Policies
CREATE POLICY "Rich text images public read" ON storage.objects FOR
SELECT
	USING (bucket_id = 'rich-text-images');

CREATE POLICY "Owners can manage their own rich text images" ON storage.objects FOR ALL TO authenticated USING (
	bucket_id = 'rich-text-images'
	AND (storage.foldername (name)) [1] = (
		SELECT
			auth.uid ()
	)::text
)
WITH
	CHECK (
		bucket_id = 'rich-text-images'
		AND (storage.foldername (name)) [1] = (
			SELECT
				auth.uid ()
		)::text
	);
