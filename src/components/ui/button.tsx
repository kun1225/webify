import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	"focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-base font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-primary/25 shadow-md hover:scale-101 hover:shadow-md',
				destructive:
					'bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs',
				outline:
					'bg-background hover:bg-accent hover:text-accent-foreground border shadow-xs hover:scale-101',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-6',
				sm: 't-body-3 h-8 gap-1.5 px-2',
				md: 't-body-3 h-10 px-4',
				lg: 'h-12.5 rounded-md px-12 text-xl shadow-lg hover:shadow-xl',
				icon: 'size-9 [&_svg]:size-4',
				'icon-sm': 'size-6 p-0 [&_svg]:size-3',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
