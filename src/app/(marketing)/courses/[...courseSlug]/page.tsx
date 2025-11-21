export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ courseSlug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const { courseSlug } = await params;
	console.log('🚀 ~ Page ~ courseSlug:', courseSlug);

	return <div className="pt-26">CoursePage</div>;
}
