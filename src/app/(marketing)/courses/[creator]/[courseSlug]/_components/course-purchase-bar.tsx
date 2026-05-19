'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import { hasValueObject } from '@/lib/utils';

import type { CourseForCourseDetail } from '@/types';

const SCROLL_THRESHOLD = 40;

export function CoursePurchaseBar({
	data,
	handleBuy,
}: {
	data: CourseForCourseDetail;
	handleBuy: () => void | Promise<void>;
}) {
	const barRef = useRef<HTMLElement>(null);
	const prevScroll = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			if (!barRef.current) return;

			const currentScroll = window.scrollY;

			const isScrollDown =
				currentScroll > prevScroll.current + SCROLL_THRESHOLD;
			const isScrollUp = currentScroll < prevScroll.current - SCROLL_THRESHOLD;

			if (isScrollDown) {
				barRef.current.setAttribute('data-is-scroll-down', 'true');
				prevScroll.current = currentScroll;
			} else if (isScrollUp) {
				barRef.current.setAttribute('data-is-scroll-down', 'false');
				prevScroll.current = currentScroll;
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	if (!hasValueObject(data)) return null;

	const { title, price, isPurchased } = data;
	const ctaLabel = isPurchased
		? '前往我的課程'
		: price === 0
			? '立即觀看'
			: '立即購買';
	const formattedPrice = price === 0 ? '免費課程' : `NT$${price}`;

	return (
		<footer
			ref={barRef}
			data-is-scroll-down="false"
			className="border-border px-edge fixed bottom-0 left-0 z-10 w-full border-t bg-white py-4 shadow-lg transition-transform duration-300 data-[is-scroll-down=false]:translate-y-full lg:hidden"
		>
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				{title && <p className="t-heading-5">{title}</p>}

				<div className="ml-auto flex items-center gap-4 md:ml-0">
					{price && (
						<p className="t-heading-5 text-primary">{formattedPrice}</p>
					)}
					<Button onClick={handleBuy}>{ctaLabel}</Button>
				</div>
			</div>
		</footer>
	);
}
