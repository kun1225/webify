import { redirect } from 'next/navigation';

import { getCurrentUserProfile } from '@/services/server/auth';
import { AppError } from '@/types';

export default async function StudioLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const profileResult = await getCurrentUserProfile();

	if (!profileResult.ok) {
		if (profileResult.code === AppError.UNAUTHENTICATED) {
			redirect('/auth/login');
		}

		throw new Error(profileResult.message);
	}

	const isCreator =
		profileResult.data.role === 'creator' ||
		profileResult.data.role === 'admin';

	if (!isCreator) {
		redirect('/my-courses');
	}

	return children;
}
