import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/services/server/auth';
import { getCourseById } from '@/services/server/course';
import { getLessonsByCourseId } from '@/services/server/lesson';

import { EditCourseIdProvider } from './_components/edit-course-id-provider';
import { EditCourseForm } from './_components/edit-course-form';
import { EditCourseDeleteSection } from './_components/edit-course-delete-section';
import { EditCourseLessons } from './_components/edit-course-lessons';

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug: courseId } = await params;

	const [userRes, courseRes, lessonsRes] = await Promise.all([
		getCurrentUserProfile(),
		getCourseById(courseId),
		getLessonsByCourseId(courseId),
	]);

	if (!userRes.ok) {
		redirect('/auth/login');
	}

	if (!courseRes.ok) {
		console.error(courseRes);
		throw new Error(courseRes.code);
	}

	if (!lessonsRes.ok) {
		console.error(lessonsRes);
		throw new Error(lessonsRes.code);
	}

	return (
		<EditCourseIdProvider courseId={courseId}>
			<div className="px-edge space-y-32 py-6">
				<EditCourseForm user={userRes.data} initData={courseRes.data} />
				<EditCourseLessons lessons={lessonsRes.data} />
				<EditCourseDeleteSection />
			</div>
		</EditCourseIdProvider>
	);
}
