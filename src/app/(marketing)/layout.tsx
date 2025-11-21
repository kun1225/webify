import { Header } from '@/layouts/header';
import { Footer } from '@/layouts/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="pt-26">
			<Header />
			<main className="min-h-screen">{children}</main>
			<Footer />
		</div>
	);
}
