import { notFound } from 'next/navigation';

import {
	getCourseBySlug,
	getCourseSlugsAndCreator,
} from '@/services/server/courses';

import { CourseDetailPage } from './_components/course-detail-page';

export async function generateStaticParams() {
	const result = await getCourseSlugsAndCreator();
	if (!result.ok) return [];

	return result.data;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ creator: string; courseSlug: string }>;
}) {
	const { courseSlug } = await params;
	const courseResult = await getCourseBySlug(courseSlug);

	if (!courseResult.ok) return {};

	const { title, creator } = courseResult.data;
	return {
		title: `【 ${creator} 線上課程 】${title}`,
	};
}

export default async function Page({
	params,
}: {
	params: Promise<{ creator: string; courseSlug: string }>;
}) {
	const { courseSlug } = await params;
	const courseResult = await getCourseBySlug(courseSlug);

	if (!courseResult.ok) return notFound();

	return <CourseDetailPage data={courseResult.data} />;
}
