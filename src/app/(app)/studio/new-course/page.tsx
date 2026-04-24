import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/services/server/auth';
import { CourseForm } from '@/components/course-form';
import { AppPageHeader } from '../../_components/app-page-header';

export default async function Page() {
	const profileResult = await getCurrentUserProfile();

	if (!profileResult.ok) {
		redirect('/auth/login');
	}

	return (
		<div className="px-edge flex w-full flex-col gap-6 py-6">
			<AppPageHeader
				title="建立新課程"
				description="創建一個全新的課程，開始分享您的知識與技能。"
			/>
			<CourseForm user={profileResult.data} />
		</div>
	);
}
