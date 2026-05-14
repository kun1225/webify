import { notFound } from 'next/navigation';

import { getLessonAndContentById } from '@/services/server/lesson';

import { AppPageHeader } from '@/app/(app)/_components/app-page-header';
import { EditCourseIdProvider } from '../_components/edit-course-id-provider';

import { LessonForm } from './_components/lesson-form';
import { LessonDelete } from './_components/lesson-delete';

export default async function EditCourseLessonPage({
	params,
}: {
	params: Promise<{ slug: string; lessonId: string }>;
}) {
	const { slug: courseId, lessonId } = await params;

	const lessonResult = await getLessonAndContentById(lessonId);

	if (!lessonResult.ok) {
		notFound();
	}

	return (
		<EditCourseIdProvider courseId={courseId}>
			<div className="px-edge space-y-6 py-6">
				<AppPageHeader
					title="編輯課程單元"
					description="編輯您的課程單元，包括標題、影片和內容"
				/>
				<LessonForm lesson={lessonResult.data} />
				<LessonDelete data={lessonResult.data} />
			</div>
		</EditCourseIdProvider>
	);
}
