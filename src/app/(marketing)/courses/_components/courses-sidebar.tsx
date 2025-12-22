'use client';

import { cn } from '@/lib/utils';

import { priceFilterOptions } from '../_utils/courses-helpers';

import type { CoursesPriceFilterOption } from '@/types';
import { Button } from '@/components/ui/button';

export function CoursesSidebar({ className }: { className?: string }) {
	const currentPriceFilter = 'all';

	const handlePriceFilterChange = (value: CoursesPriceFilterOption) => {
		// TODO: Implement price filter change
	};

	return (
		<aside className={cn('mt-24 w-24 space-y-4 xl:w-60', className)}>
			<h3 className="t-heading-4 text-foreground font-bold">價格</h3>

			<div className="flex flex-col gap-4">
				{priceFilterOptions.map((option) => {
					const isSelected = currentPriceFilter === option.value;

					return (
						<Button
							disabled={isSelected}
							key={option.value}
							variant="link"
							onClick={() => handlePriceFilterChange(option.value)}
							className="disabled:text-primary h-7 justify-start px-0.5 disabled:opacity-100"
						>
							{option.label}
						</Button>
					);
				})}
			</div>
		</aside>
	);
}
