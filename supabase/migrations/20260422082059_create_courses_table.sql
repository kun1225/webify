-- Create courses table
-- Maybe we should set purchases and duration default to 0 and non-nullable
CREATE TABLE public.courses (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	slug TEXT NOT NULL,
	description JSONB,
	cover_image_url TEXT,
	price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
	duration DECIMAL(4, 1) CHECK (
		duration IS NULL
		OR duration >= 0
	),
	purchases INTEGER NOT NULL DEFAULT 0 CHECK (purchases >= 0),
	is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
	creator_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	-- A unique constraint to ensure that each course has a unique slug within a creator's collection
	UNIQUE (creator_id, slug)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "User can view unhidden or own courses" ON public.courses FOR
SELECT
	USING (
		is_hidden = FALSE
		OR creator_id = (
			SELECT
				auth.uid ()
		)
	);

CREATE POLICY "Creators and admins can insert their own courses" ON public.courses FOR INSERT TO authenticated
WITH
	CHECK (
		auth.uid () = creator_id
		AND EXISTS (
			SELECT
				1
			FROM
				public.users
			WHERE
				id = auth.uid ()
				AND role IN ('creator', 'admin')
		)
	);

CREATE POLICY "Creators and admins can update their own courses" ON public.courses
FOR UPDATE
	TO authenticated USING (
		auth.uid () = creator_id
		AND EXISTS (
			SELECT
				1
			FROM
				public.users
			WHERE
				id = auth.uid ()
				AND role IN ('creator', 'admin')
		)
	)
WITH
	CHECK (
		auth.uid () = creator_id
		AND EXISTS (
			SELECT
				1
			FROM
				public.users
			WHERE
				id = auth.uid ()
				AND role IN ('creator', 'admin')
		)
	);

CREATE POLICY "Creators and admins can delete their own courses" ON public.courses FOR DELETE TO authenticated USING (
	auth.uid () = creator_id
	AND EXISTS (
		SELECT
			1
		FROM
			public.users
		WHERE
			id = auth.uid ()
			AND role IN ('creator', 'admin')
	)
);

-- Functions
CREATE OR REPLACE FUNCTION public.on_courses_updated () RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = timezone('utc', now());
	RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET
	search_path = public;

-- Triggers
CREATE OR REPLACE TRIGGER handle_courses_updated BEFORE
UPDATE ON public.courses FOR EACH ROW
EXECUTE FUNCTION public.on_courses_updated ();

-- Index
CREATE INDEX idx_courses_creator_id ON public.courses (creator_id);

CREATE INDEX idx_courses_slug ON public.courses (slug);

INSERT INTO
	storage.buckets (id, name, public, allowed_mime_types)
VALUES
	(
		'course-covers',
		'course-covers',
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

-- Policy for public read access
CREATE POLICY "Course Covers Public Read" ON storage.objects FOR
SELECT
	TO public USING (bucket_id = 'course-covers');

-- Policy for authenticated users to manage their own course covers
CREATE POLICY "Creators and admins can manage their own course covers" ON storage.objects FOR ALL TO authenticated USING (
	bucket_id = 'course-covers'
	AND (storage.foldername (name)) [1] = auth.uid ()::text -- creator_id is 1st level
	AND EXISTS (
		SELECT
			1
		FROM
			public.users
		WHERE
			id = auth.uid ()
			AND role IN ('creator', 'admin')
	)
)
WITH
	CHECK (
		bucket_id = 'course-covers'
		AND (storage.foldername (name)) [1] = auth.uid ()::text -- creator_id is 1st level
		AND EXISTS (
			SELECT
				1
			FROM
				public.users
			WHERE
				id = auth.uid ()
				AND role IN ('creator', 'admin')
		)
	);
