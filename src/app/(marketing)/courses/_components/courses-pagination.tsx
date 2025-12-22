'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

export function CoursesPagination({ totalPages }: { totalPages: number }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const allQueryParams = Object.fromEntries(searchParams.entries());

	const currentPage = Number(searchParams.get('page')) || 1;

	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers(currentPage, totalPages);

	return (
		<Pagination className="text-muted-foreground">
			<PaginationContent>
				{currentPage > 1 && (
					<PaginationItem>
						<PaginationPrevious
							href={{
								pathname,
								query: {
									...allQueryParams,
									page: currentPage - 1,
								},
							}}
						/>
					</PaginationItem>
				)}

				{pageNumbers.map((pageNum, index) => {
					if (pageNum === 'ellipsis') {
						return (
							<PaginationItem key={index}>
								<PaginationEllipsis />
							</PaginationItem>
						);
					}

					return (
						<PaginationItem key={pageNum}>
							<PaginationLink
								isActive={
									pageNum === currentPage ||
									(pageNum === 1 && currentPage === 0)
								}
								href={{
									pathname,
									query: {
										...allQueryParams,
										page: pageNum,
									},
								}}
							>
								{pageNum}
							</PaginationLink>
						</PaginationItem>
					);
				})}

				{currentPage < totalPages && (
					<PaginationItem>
						<PaginationNext
							href={{
								pathname,
								query: {
									...allQueryParams,
									page: currentPage + 1,
								},
							}}
						/>
					</PaginationItem>
				)}
			</PaginationContent>
		</Pagination>
	);
}

const SHOW_PAGES_NEAR_CURRENT_PAGE = 2;
const MAX_PAGES_BEFORE_ELLIPSIS = 5;

function getPageNumbers(currentPage: number, totalPages: number) {
	const pages: (number | 'ellipsis')[] = [];

	const outOfRange = currentPage <= 0 || currentPage > totalPages;

	// Show all pages if total pages is less than max
	if (totalPages <= MAX_PAGES_BEFORE_ELLIPSIS || outOfRange) {
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i);
		}
	} else {
		// Always show first page
		pages.push(1);

		const startPage = Math.max(currentPage - SHOW_PAGES_NEAR_CURRENT_PAGE, 2);
		const endPage = Math.min(
			currentPage + SHOW_PAGES_NEAR_CURRENT_PAGE,
			totalPages - 1,
		);

		// Add ellipsis after first page if needed
		if (startPage > 2) {
			pages.push('ellipsis');
		}

		// Add page numbers around current page
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		// Add ellipsis before last page if needed
		if (endPage < totalPages - 1) {
			pages.push('ellipsis');
		}

		// Always show last page
		pages.push(totalPages);
	}

	return pages;
}
