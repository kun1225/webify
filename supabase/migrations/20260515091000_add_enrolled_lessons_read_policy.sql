DO $$
BEGIN
	IF NOT EXISTS (
		SELECT
			1
		FROM
			pg_policies
		WHERE
			schemaname = 'public'
			AND tablename = 'lessons'
			AND policyname = 'Enrolled users can read lessons'
	) THEN
		CREATE POLICY "Enrolled users can read lessons" ON public.lessons FOR
		SELECT
			TO authenticated USING (
				EXISTS (
					SELECT
						1
					FROM
						public.user_course_enrollments
					WHERE
						user_course_enrollments.user_id = (
							SELECT
								auth.uid ()
						)
						AND user_course_enrollments.course_id = lessons.course_id
						AND user_course_enrollments.enrolled_at IS NOT NULL
				)
			);
	END IF;
END $$;
