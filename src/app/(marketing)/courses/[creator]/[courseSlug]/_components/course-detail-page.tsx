'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Orbit } from 'lucide-react';
import { toast } from 'sonner';

import { hasArrayValue } from '@/lib/utils';
import { RichTextEditor } from '@/components/rich-text-editor';

import { CoursePromoCard } from './course-promo-card';
import { CourseMetaList } from './course-meta-list';
import { CoursePurchaseBar } from './course-purchase-bar';
import { CourseCta } from './course-cta';

import { type JSONContent } from '@tiptap/core';
import { AppError, type CourseForCourseDetail } from '@/types';
import type { Route } from 'next';

export function CourseDetailPage({ data }: { data: CourseForCourseDetail }) {
	const { title, slug, creator, coverImageUrl, description, lessons, price } =
		data || {};

	const router = useRouter();

	const handleBuy = async () => {
		if (data.isPurchased) {
			router.push(`/my-courses/${data.id}`);
			return;
		}

		const response = await fetch('/api/checkout-sessions', {
			method: 'POST',
			body: JSON.stringify({
				title,
				price,
				coverImageUrl,
				cancelUrl: `/courses/${creator}/${slug}`,
				metadata: {
					course_id: data.id,
					purchase_type: 'course',
				},
			}),
		});

		const res = await response.json();

		if (!res.ok) {
			switch (res.code) {
				case AppError.UNAUTHENTICATED: {
					setTimeout(() => {
						toast.error('請先登入帳號');
					});
					router.push(
						`/auth/login?next=${encodeURIComponent(`/courses/${creator}/${slug}`)}`,
					);
					return;
				}
				default:
					console.error('handleBuy ~ res:', res);
					toast.error('購買失敗，請稍後再試');
					break;
			}
		}

		const { url } = res.data;
		if (url) {
			toast.success('購買成功');
			router.push(url as Route);
		}
	};

	return (
		<>
			<header className="px-edge mt-header relative flex aspect-video w-full items-end pt-24 md:max-h-[60svh]">
				<div className="mx-auto mb-12 w-5xl text-white md:mb-24">
					{creator && <p className="t-body-2 text-muted">{creator}</p>}

					{title && <h1 className="t-heading-1 mb-4 text-white">{title}</h1>}

					<CourseCta data={data} handleBuy={handleBuy} />
				</div>

				<div className="absolute inset-0 -z-10 after:absolute after:inset-0 after:z-10 after:bg-black/80">
					{coverImageUrl ? (
						<Image
							src={coverImageUrl}
							alt={title}
							fill
							className="object-cover blur-lg"
						/>
					) : (
						<Orbit className="absolute inset-0 size-full opacity-50" />
					)}
				</div>
			</header>

			<section className="my-section px-edge">
				<div className="mx-auto flex w-full justify-between gap-8 lg:w-5xl">
					<div className="grow space-y-8">
						<p className="t-heading-2 before:bg-primary relative pl-4 before:absolute before:left-0 before:h-full before:w-2">
							課程資訊
						</p>

						<CourseMetaList data={data} />

						{description && (
							<RichTextEditor
								className="mt-16"
								value={description as JSONContent}
								isViewMode
								showToolbar={false}
							/>
						)}

						{hasArrayValue(lessons) && (
							<div className="border-border rounded-lg border shadow-sm">
								<p className="bg-muted text-primary t-body-1 px-2 py-1 font-bold">
									章節目錄
								</p>
								<ul className="divide-muted-border t-body-2 divide-y">
									{lessons.map((lesson) => (
										<li key={lesson.id} className="p-3">
											{lesson.title}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<aside className="hidden max-w-sm min-w-xs lg:block">
						<div className="top-header-6 sticky">
							<CoursePromoCard data={data} handleBuy={handleBuy} />
						</div>
					</aside>
				</div>
			</section>

			<CoursePurchaseBar data={data} handleBuy={handleBuy} />
		</>
	);
}
