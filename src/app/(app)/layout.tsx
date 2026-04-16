import { cookies } from 'next/headers';

import { AppSidebar } from '@/layouts/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar isCreator={true} />
			<main className="@container/main w-full pt-12">{children}</main>
		</SidebarProvider>
	);
}
