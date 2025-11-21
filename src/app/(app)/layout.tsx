export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="pt-26">
			<p>Sidebar</p>
			<main>{children}</main>
		</div>
	);
}
