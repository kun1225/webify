import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppSidebar } from '@/layouts/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUserProfile } from '@/services/server/auth';
import { AppError } from '@/types';

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

	const profileResult = await getCurrentUserProfile();

	if (!profileResult.ok) {
		if (profileResult.code === AppError.UNAUTHENTICATED) {
			redirect('/auth/login');
		}

		throw new Error(profileResult.message);
	}

	const profile = profileResult.data;
	const isCreator = profile.role === 'creator' || profile.role === 'admin';

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar isCreator={isCreator} />
			<main className="@container/main w-full pt-12">{children}</main>
		</SidebarProvider>
	);
}
