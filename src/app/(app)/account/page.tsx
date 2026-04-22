import { getCurrentUserProfile } from '@/services/server/auth';

import { AppPageHeader } from '../_components/app-page-header';
import { ProfileForm } from '@/app/(app)/account/_components/profile-form';

import { redirect } from 'next/navigation';
import { RoleSection } from './_components/role-section';

export default async function AccountPage() {
	const res = await getCurrentUserProfile();

	if (!res.ok) {
		redirect('/auth/login');
	}

	return (
		<section className="px-edge w-full space-y-8 py-6">
			<AppPageHeader
				title="帳戶設定"
				description="管理您的個人資料和帳戶設定"
			/>

			<RoleSection user={res.data} />

			<ProfileForm user={res.data} />
		</section>
	);
}
