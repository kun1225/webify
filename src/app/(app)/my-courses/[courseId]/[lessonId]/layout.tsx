import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { cn } from '@/lib/utils';
import { getLessonTitlesByCourseId } from '@/services/server/lesson';
import { AppError } from '@/types';

export default async function Layout({
	params,
	children,
}: {
	params: Promise<{ courseId: string; lessonId: string }>;
	children: React.ReactNode;
}) {
	const { courseId, lessonId } = await params;

	const lessonTitlesResult = await getLessonTitlesByCourseId(courseId);

	if (!lessonTitlesResult.ok) {
		switch (lessonTitlesResult.code) {
			case AppError.UNAUTHENTICATED:
				redirect(
					`/auth/login?next=${encodeURIComponent(`/my-courses/${courseId}/${lessonId}`)}`,
				);
			default:
				notFound();
		}
	}

	const lessonTitles = lessonTitlesResult.data;

	return (
		<div className="px-edge py-6">
			<div className="gap-edge mt-6 grid grid-cols-1 @5xl/main:grid-cols-[1fr_4fr]">
				<aside>
					<div className="sticky top-8">
						<h2 className="t-heading-4 text-foreground">課程大綱</h2>

						{lessonTitles.length ? (
							<ol className="mt-4 space-y-2">
								{lessonTitles.map((courseLesson) => {
									const isActive = courseLesson.id === lessonId;

									return (
										<li key={courseLesson.id}>
											<Link
												href={`/my-courses/${courseId}/${courseLesson.id}`}
												className={cn(
													't-body-3 focus-visible:ring-primary/40 flex items-start gap-3 rounded-lg px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none',
													isActive
														? 'bg-primary/10 text-primary'
														: 'text-foreground hover:bg-muted',
												)}
												aria-current={isActive ? 'page' : undefined}
											>
												{courseLesson.title}
											</Link>
										</li>
									);
								})}
							</ol>
						) : (
							<p className="text-muted-foreground t-body-3">
								尚未建立其他課程單元
							</p>
						)}
					</div>
				</aside>

				<section className="grow space-y-6">{children}</section>
			</div>
		</div>
	);
}
