CREATE OR REPLACE FUNCTION public.increment_course_purchases () RETURNS TRIGGER AS $$
BEGIN
	UPDATE public.courses
	SET
		purchases = purchases + 1
	WHERE
		id = NEW.course_id;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET
	search_path = public;

DROP TRIGGER IF EXISTS trigger_increment_purchases ON public.user_course_enrollments;

CREATE TRIGGER trigger_increment_purchases
AFTER INSERT ON public.user_course_enrollments FOR EACH ROW
EXECUTE FUNCTION public.increment_course_purchases ();
