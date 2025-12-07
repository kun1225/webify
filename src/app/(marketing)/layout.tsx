import { Header } from '@/layouts/header';
import { Footer } from '@/layouts/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Header />
			<main className="from-primary/5 to-background bg-linear-to-b">
				{children}
			</main>
			<Footer />
		</>
	);
}
