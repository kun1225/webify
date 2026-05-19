import Link from 'next/link';

import { ChevronRight, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import type { LessonForCourseDetail } from '@/types';

export function CourseLessons({
	courseId,
	lessons,
}: {
	courseId: string;
	lessons: LessonForCourseDetail[];
}) {
	if (!lessons?.length) {
		return (
			<Card className="bg-muted grid h-80 place-content-center text-center">
				<CardContent>
					<PlayCircle className="text-muted-foreground mx-auto size-16" />

					<div className="mt-8">
						<h2 className="t-heading-4 text-foreground">
							講師尚未建立課程內容
						</h2>
						<p className="text-muted-foreground t-body-2 mt-2">
							完成購買後，講師會陸續解鎖課程單元，請稍後再回來看看。
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<section className="space-y-5">
			<h2 className="t-heading-2 text-primary">課程單元</h2>

			<ol className="space-y-4">
				{lessons.map((lesson, index) => (
					<li
						key={lesson.id}
						className="group transition-all duration-200 hover:-translate-y-0.5"
					>
						<Link href={`/my-courses/${courseId}/${lesson.id}`}>
							<Card className="group-hover:border-primary/40 shadow-primary/20 group-hover:shadow-sm">
								<CardContent className="flex items-center justify-between gap-4">
									<div>
										<p className="text-muted-foreground t-body-4 font-medium">
											第 {String(index + 1).padStart(2, '0')} 節
										</p>
										<h3 className="t-heading-4 text-foreground mt-1">
											{lesson.title}
										</h3>
									</div>

									<Button
										size="md"
										variant="outline"
										className="text-primary group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-101"
									>
										<span>開始學習</span>
										<ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
									</Button>
								</CardContent>
							</Card>
						</Link>
					</li>
				))}
			</ol>
		</section>
	);
}
