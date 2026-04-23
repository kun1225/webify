import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { AppPageHeader } from '../_components/app-page-header';

import { Button } from '@/components/ui/button';
import { getCurrentUserProfile } from '@/services/server/auth';
import { getCreatorCourses } from '@/services/server/course';
import { StudioCourses } from './_components/studio-courses';
import { StudioStats } from './_components/studio-stats';
import { AppError } from '@/types/result';

export default async function StudioPage() {
	const profileResult = await getCurrentUserProfile();

	if (!profileResult.ok) {
		if (profileResult.code === AppError.UNAUTHENTICATED) {
			redirect(`/auth/login?next=${encodeURIComponent('/studio')}`);
		}

		throw new Error(profileResult.message);
	}

	const isCreator =
		profileResult.data.role === 'creator' ||
		profileResult.data.role === 'admin';

	if (!isCreator) {
		redirect('/my-courses');
	}

	const coursesResult = await getCreatorCourses();

	if (!coursesResult.ok) {
		switch (coursesResult.code) {
			case AppError.UNAUTHENTICATED:
				redirect('/auth/login');
			case AppError.NOT_FOUND:
				notFound();
			default:
				throw new Error(coursesResult.message || 'Internal error');
		}
	}

	return (
		<div className="px-edge flex w-full flex-col gap-6 py-6">
			<div className="flex flex-col justify-between gap-2 @md/main:flex-row">
				<AppPageHeader
					title="課程管理"
					description="查看營收與管理您的課程，包括新增、編輯和刪除課程。"
				/>

				<Button asChild className="@md/main:self-end">
					<Link href="/studio/new-course">新增課程</Link>
				</Button>
			</div>

			<StudioStats data={coursesResult.data.courses} />
			<StudioCourses data={coursesResult.data.courses} />
		</div>
	);
}
