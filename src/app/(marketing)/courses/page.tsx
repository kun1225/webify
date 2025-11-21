import Link from 'next/link';

export default async function Page() {
	return (
		<div className="pt-26">
			<Link
				href={{
					pathname: '/courses/react-basic',
					query: {
						page: 1,
						limit: 10,
					},
				}}
			>
				課程列表
			</Link>
		</div>
	);
}
