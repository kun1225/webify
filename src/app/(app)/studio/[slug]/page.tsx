import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/services/server/auth';
import { getCourseById } from '@/services/server/course';

import { EditCourseIdProvider } from './_components/edit-course-id-provider';
import { EditCourseForm } from './_components/edit-course-form';
import { EditCourseDeleteSection } from './_components/edit-course-delete-section';

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug: courseId } = await params;

	const [userRes, courseRes] = await Promise.all([
		getCurrentUserProfile(),
		getCourseById(courseId),
	]);

	if (!userRes.ok) {
		redirect('/auth/login');
	}

	if (!courseRes.ok) {
		console.error(courseRes);
		throw new Error(courseRes.code);
	}

	return (
		<EditCourseIdProvider courseId={courseId}>
			<div className="px-edge space-y-32 py-6">
				<EditCourseForm user={userRes.data} initData={courseRes.data} />
				<EditCourseDeleteSection />
			</div>
		</EditCourseIdProvider>
	);
}
