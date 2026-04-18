import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

export function FormButton({
	isLoading,
	label,
	type = 'submit',
	...props
}: React.ComponentProps<typeof Button> & {
	isLoading: boolean;
	label: string;
}) {
	return (
		<Button
			type={type}
			disabled={isLoading}
			aria-describedby={isLoading ? 'loading-text' : undefined}
			{...props}
		>
			{isLoading ? (
				<>
					<LoaderCircle className="animate-spin" />
					<span>{label}中...</span>
				</>
			) : (
				label
			)}
		</Button>
	);
}
