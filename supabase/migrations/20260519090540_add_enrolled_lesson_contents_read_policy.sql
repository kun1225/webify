DO $$
BEGIN
	IF NOT EXISTS (
		SELECT
			1
		FROM
			pg_policies
		WHERE
			schemaname = 'public'
			AND tablename = 'lesson_contents'
			AND policyname = 'Enrolled users can read lesson contents'
	) THEN
		CREATE POLICY "Enrolled users can read lesson contents" ON public.lesson_contents FOR
		SELECT
			TO authenticated USING (
				EXISTS (
					SELECT
						1
					FROM
						public.user_course_enrollments
						JOIN public.lessons ON lessons.course_id = user_course_enrollments.course_id
					WHERE
						user_course_enrollments.user_id = (
							SELECT
								auth.uid ()
						)
						AND lessons.id = lesson_contents.lesson_id
						AND user_course_enrollments.enrolled_at IS NOT NULL
				)
			);
	END IF;
END $$;
