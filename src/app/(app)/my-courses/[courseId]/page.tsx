import { notFound, redirect } from 'next/navigation';

import { getPurchasedCourseDetail } from '@/services/server/courses';
import { AppError } from '@/types';

import { CourseHero } from './_components/course-hero';
import { CourseLessons } from './_components/course-lessons';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ courseId: string }>;
}) {
	const { courseId } = await params;
	const courseResult = await getPurchasedCourseDetail(courseId);

	if (!courseResult.ok) return {};

	return {
		title: `${courseResult.data.title} | 我的課程`,
	};
}

export default async function MyCoursesDetailPage({
	params,
}: {
	params: Promise<{ courseId: string }>;
}) {
	const { courseId } = await params;
	const courseResult = await getPurchasedCourseDetail(courseId);

	if (!courseResult.ok) {
		switch (courseResult.code) {
			case AppError.FORBIDDEN:
			case AppError.NOT_FOUND:
				notFound();
			case AppError.UNAUTHENTICATED:
				redirect(
					`/auth/login?next=${encodeURIComponent(`/my-courses/${courseId}`)}`,
				);
			default:
				throw new Error(courseResult.message);
		}
	}

	const course = courseResult.data;

	return (
		<section className="px-edge space-y-7 py-6">
			<CourseHero data={course} />
			<CourseLessons courseId={course.id} lessons={course.lessons} />
		</section>
	);
}
