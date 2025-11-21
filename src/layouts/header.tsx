import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const headerNavLinks = [
	{
		label: '首頁',
		href: '/',
	},
	{
		label: '關於我們',
		href: '/about',
	},
	{
		label: '所有課程',
		href: '/courses',
	},
];

export function Header() {
	return (
		<header className="bg-background border-b-border px-edge z-header fixed top-0 flex w-full items-center justify-between border-b py-6 shadow-sm">
			<Link href="/" className="relative block h-8 w-42">
				<Image src="/logo.svg" alt="logo" fill />
			</Link>

			<nav className="mr-auto ml-12">
				<ul className="flex items-center gap-1">
					{headerNavLinks.map((link) => (
						<li key={link.href}>
							<Button
								variant="link"
								size="sm"
								asChild
								className="text-muted-foreground"
							>
								<Link href={link.href}>{link.label}</Link>
							</Button>
						</li>
					))}
				</ul>
			</nav>

			<Button asChild>
				<Link href="/auth/login">登入</Link>
			</Button>
		</header>
	);
}
