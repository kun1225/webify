import Link from 'next/link';
import { Button } from '@/components/ui/button';

const footerNavLinks = [
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

export function Footer() {
	return (
		<footer className="bg-secondary px-edge text-secondary-foreground pt-12 pb-8 text-center">
			<h2 className="text-primary text-2xl font-bold">Webify</h2>

			<nav className="mt-4">
				<ul className="flex items-center justify-center">
					{footerNavLinks.map((link) => (
						<li key={link.href}>
							<Button
								variant="link"
								size="sm"
								asChild
								className="text-secondary-foreground"
							>
								<Link href={link.href}>{link.label}</Link>
							</Button>
						</li>
					))}
				</ul>
			</nav>

			<p className="mt-12 text-xs">
				&copy; {new Date().getFullYear()} Webify. All rights reserved.
			</p>
		</footer>
	);
}
