import { Fragment } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function CoursesLoading() {
	return (
		<div className="space-y-8 lg:flex lg:gap-16 lg:space-y-0">
			{/* Mobile Filter Skeleton */}
			<div className="flex lg:hidden">
				<Skeleton className="h-10 w-full max-w-sm rounded-md" />
			</div>

			{/* Desktop Sidebar Skeleton */}
			<aside className="mt-24 hidden w-24 space-y-4 lg:block xl:w-60">
				<div className="space-y-4">
					<Skeleton className="h-8 w-full" />
					<div className="space-y-4">
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-7 w-16" />
						<Skeleton className="h-7 w-16" />
					</div>
				</div>
			</aside>

			<div className="w-full space-y-8">
				{/* Desktop Header Skeleton */}
				<div className="border-border hidden items-center justify-between border-b pb-6 lg:flex">
					<Skeleton className="h-5 w-24" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-12" />
						<Skeleton className="h-8 w-39" />
					</div>
				</div>

				<CoursesGridSkeleton />
			</div>
		</div>
	);
}

export function CoursesGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-1 lg:grid-cols-3 lg:gap-8">
			{Array.from({ length: 6 }).map((_, index) => (
				<Fragment key={index}>
					<Skeleton key={index} className="h-30 w-full rounded-xl lg:h-90" />

					<Separator className="lg:hidden" />
				</Fragment>
			))}
		</div>
	);
}
