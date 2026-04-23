import { Card } from './ui/card';
import { cn } from '@/lib/utils';

export function EmptyCard({
	title,
	description,
	iconComponent,
	actionComponent,
	className,
}: {
	title: string;
	description: string;
	iconComponent: React.ReactNode;
	actionComponent: React.ReactNode;
	className?: string;
}) {
	return (
		<Card
			className={cn(
				'flex flex-col items-center justify-center gap-6 py-12 text-center',
				className,
			)}
		>
			{iconComponent && (
				<div className="bg-secondary text-secondary-foreground flex size-28 items-center justify-center rounded-full [&_svg]:size-13">
					{iconComponent}
				</div>
			)}

			<div className="max-w-md">
				{title && (
					<h3 className="text-foreground t-body-1 font-bold">{title}</h3>
				)}
				{description && (
					<p className="t-body-2 text-muted-foreground mt-1">{description}</p>
				)}
			</div>

			{actionComponent && <>{actionComponent}</>}
		</Card>
	);
}
