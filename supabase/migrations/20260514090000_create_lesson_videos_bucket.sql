INSERT INTO
	storage.buckets (
		id,
		name,
		public,
		allowed_mime_types,
		file_size_limit
	)
VALUES
	(
		'lesson-videos',
		'lesson-videos',
		FALSE,
		ARRAY['video/mp4', 'video/webm'],
		52428800
	)
ON CONFLICT (id) DO UPDATE
SET
	public = excluded.public,
	allowed_mime_types = excluded.allowed_mime_types,
	file_size_limit = excluded.file_size_limit;

-- TODO: 當學生購買課程與學習頁流程完成後，再補上 enrolled users 的讀取 policy。
CREATE POLICY "Creators can upload lesson videos" ON storage.objects FOR INSERT TO authenticated
WITH
	CHECK (
		bucket_id = 'lesson-videos'
		AND (storage.foldername (name)) [1] = (
			SELECT
				auth.uid ()
		)::text
		AND EXISTS (
			SELECT
				1
			FROM
				public.courses
			WHERE
				courses.id::text = (storage.foldername (name)) [2]
				AND courses.creator_id = (
					SELECT
						auth.uid ()
				)
		)
	);

CREATE POLICY "Creators can update lesson videos" ON storage.objects
FOR UPDATE
	TO authenticated USING (
		bucket_id = 'lesson-videos'
		AND (storage.foldername (name)) [1] = (
			SELECT
				auth.uid ()
		)::text
	)
WITH
	CHECK (
		bucket_id = 'lesson-videos'
		AND (storage.foldername (name)) [1] = (
			SELECT
				auth.uid ()
		)::text
	);

CREATE POLICY "Creators can read lesson videos" ON storage.objects FOR
SELECT
	TO authenticated USING (
		bucket_id = 'lesson-videos'
		AND (storage.foldername (name)) [1] = (
			SELECT
				auth.uid ()
		)::text
	);

CREATE POLICY "Creators can delete lesson videos" ON storage.objects FOR DELETE TO authenticated USING (
	bucket_id = 'lesson-videos'
	AND (storage.foldername (name)) [1] = (
		SELECT
			auth.uid ()
	)::text
);
