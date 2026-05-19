CREATE TABLE public.user_course_enrollments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
	course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
	enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
	UNIQUE (user_id, course_id)
);

ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON public.user_course_enrollments FOR
SELECT
	TO authenticated USING (
		(
			SELECT
				auth.uid ()
		) = user_id
	);

CREATE POLICY "Users can insert their own enrollments" ON public.user_course_enrollments FOR INSERT
	TO authenticated
WITH
	CHECK (
		(
			SELECT
				auth.uid ()
		) = user_id
	);

ALTER POLICY "User can view unhidden or own courses" ON public.courses USING (
	is_hidden = FALSE
	OR creator_id = (
		SELECT
			auth.uid ()
	)
	OR EXISTS (
		SELECT
			1
		FROM
			public.user_course_enrollments
		WHERE
			user_course_enrollments.course_id = courses.id
			AND user_course_enrollments.user_id = (
				SELECT
					auth.uid ()
			)
	)
);

CREATE INDEX idx_user_course_enrollments_user_id ON public.user_course_enrollments (user_id);

CREATE INDEX idx_user_course_enrollments_course_id ON public.user_course_enrollments (course_id);
