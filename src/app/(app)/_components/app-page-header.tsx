export function AppPageHeader({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<header>
			<h1 className="t-heading-2 text-shadow-xs">{title}</h1>
			{description && (
				<p className="t-body-2 text-muted-foreground mt-3">{description}</p>
			)}
		</header>
	);
}
