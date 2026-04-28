import { CourseForm } from '@/components/course-form';
import { AppPageHeader } from '@/app/(app)/_components/app-page-header';

import type { UserProfile, CourseForEdit } from '@/types';

export function EditCourseForm({
	user,
	initData,
}: {
	user: UserProfile;
	initData?: CourseForEdit;
}) {
	return (
		<section className="space-y-6">
			<AppPageHeader
				title="編輯課程"
				description="編輯您的課程，包括標題、描述、價格和長度。"
			/>
			<CourseForm user={user} initData={initData} />
		</section>
	);
}
