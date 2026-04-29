CREATE TABLE public.lessons (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	order_index INTEGER NOT NULL DEFAULT 0,
	course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	UNIQUE (course_id, order_index) DEFERRABLE INITIALLY IMMEDIATE
);

CREATE TABLE public.lesson_contents (
	lesson_id UUID PRIMARY KEY REFERENCES public.lessons (id) ON DELETE CASCADE,
	video_url TEXT,
	content JSONB,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can select their lessons" ON public.lessons FOR
SELECT
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.courses
			WHERE
				courses.id = lessons.course_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can insert lessons into their courses" ON public.lessons FOR INSERT TO authenticated
WITH
	CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.courses
			WHERE
				courses.id = lessons.course_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can update their lessons" ON public.lessons
FOR UPDATE
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.courses
			WHERE
				courses.id = lessons.course_id
				AND courses.creator_id = auth.uid ()
		)
	)
WITH
	CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.courses
			WHERE
				courses.id = lessons.course_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can delete their lessons" ON public.lessons FOR DELETE TO authenticated USING (
	EXISTS (
		SELECT
			1
		FROM
			public.courses
		WHERE
			courses.id = lessons.course_id
			AND courses.creator_id = auth.uid ()
	)
);

CREATE POLICY "Creators can select lesson contents" ON public.lesson_contents FOR
SELECT
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.lessons
				JOIN public.courses ON courses.id = lessons.course_id
			WHERE
				lessons.id = lesson_contents.lesson_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can insert lesson contents" ON public.lesson_contents FOR INSERT TO authenticated
WITH
	CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.lessons
				JOIN public.courses ON courses.id = lessons.course_id
			WHERE
				lessons.id = lesson_contents.lesson_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can update lesson contents" ON public.lesson_contents
FOR UPDATE
	TO authenticated USING (
		EXISTS (
			SELECT
				1
			FROM
				public.lessons
				JOIN public.courses ON courses.id = lessons.course_id
			WHERE
				lessons.id = lesson_contents.lesson_id
				AND courses.creator_id = auth.uid ()
		)
	)
WITH
	CHECK (
		EXISTS (
			SELECT
				1
			FROM
				public.lessons
				JOIN public.courses ON courses.id = lessons.course_id
			WHERE
				lessons.id = lesson_contents.lesson_id
				AND courses.creator_id = auth.uid ()
		)
	);

CREATE POLICY "Creators can delete lesson contents" ON public.lesson_contents FOR DELETE TO authenticated USING (
	EXISTS (
		SELECT
			1
		FROM
			public.lessons
			JOIN public.courses ON courses.id = lessons.course_id
		WHERE
			lessons.id = lesson_contents.lesson_id
			AND courses.creator_id = auth.uid ()
	)
);

CREATE INDEX idx_lessons_course_id ON public.lessons (course_id);

CREATE INDEX idx_lessons_course_id_order_index ON public.lessons (course_id, order_index);

CREATE OR REPLACE FUNCTION public.on_lessons_updated () RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = timezone('utc', now());
	RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET
	search_path = public;

CREATE OR REPLACE TRIGGER handle_lessons_updated BEFORE
UPDATE ON public.lessons FOR EACH ROW
EXECUTE FUNCTION public.on_lessons_updated ();

CREATE OR REPLACE TRIGGER handle_lesson_contents_updated BEFORE
UPDATE ON public.lesson_contents FOR EACH ROW
EXECUTE FUNCTION public.on_lessons_updated ();

CREATE OR REPLACE FUNCTION public.reorder_lessons (p_course_id UUID, p_lesson_ids UUID[]) RETURNS VOID AS $$
BEGIN
	IF NOT EXISTS (
		SELECT
			1
		FROM
			public.courses
		WHERE
			courses.id = p_course_id
			AND courses.creator_id = auth.uid ()
	) THEN
		RAISE EXCEPTION 'Not allowed to reorder lessons for this course';
	END IF;

	UPDATE public.lessons
	SET
		order_index = ordered_lessons.order_index::integer,
		updated_at = timezone('utc', now())
	FROM
		unnest(p_lesson_ids) WITH ORDINALITY AS ordered_lessons (id, order_index)
	WHERE
		lessons.id = ordered_lessons.id
		AND lessons.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql
SET
	search_path = public;
