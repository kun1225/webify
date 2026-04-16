import Link from 'next/link';
import { BookOpen, Folder, LogOut, Settings } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	SidebarTrigger,
	SidebarFooter,
} from '@/components/ui/sidebar';
import { signOut } from '@/services/server/auth';

// Menu items.
const items = [
	{
		title: '課程列表',
		url: '/my-courses',
		icon: BookOpen,
	},
	{
		title: '課程管理',
		url: '/studio',
		icon: Folder,
	},
	{
		title: '帳號設定',
		url: '/account',
		icon: Settings,
	},
];

export function AppSidebar({ isCreator }: { isCreator: boolean }) {
	const sidebarItems = items.filter(
		(item) => isCreator || item.title !== '課程管理',
	);

	return (
		<Sidebar variant="sidebar" collapsible="icon">
			<SidebarHeader className="relative">
				<SidebarMenuButton
					asChild
					className="text-primary t-body-1 w-fit font-bold blur-none transition-opacity ease-linear group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0"
				>
					<Link href="/">Webify</Link>
				</SidebarMenuButton>
				<SidebarTrigger className="border-border absolute top-1/2 right-2.5 -translate-y-1/2 border group-data-[collapsible=icon]:border-transparent" />
			</SidebarHeader>
			<SidebarSeparator />

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<SidebarMenuButtonLabel>
												{item.title}
											</SidebarMenuButtonLabel>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenuButton onClick={signOut}>
					<LogOut />
					<SidebarMenuButtonLabel>登出帳號</SidebarMenuButtonLabel>
				</SidebarMenuButton>
			</SidebarFooter>
		</Sidebar>
	);
}

function SidebarMenuButtonLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="transition-opacity ease-linear group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:opacity-0">
			{children}
		</span>
	);
}
