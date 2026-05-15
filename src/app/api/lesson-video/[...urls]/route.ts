import { NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ urls: string[] }> },
) {
	const { urls } = await params;

	const supabase = await createSupabaseServerClient();

	const { data: sessionData, error: sessionError } =
		await supabase.auth.getSession();
	const accessToken = sessionData?.session?.access_token;

	if (sessionError || !accessToken) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const objectUrl = `${baseUrl}/storage/v1/object/authenticated/lesson-videos/${encodeURI(urls.join('/'))}`;

	const range = req.headers.get('Range') ?? undefined;

	const upstream = await fetch(objectUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...(range ? { Range: range } : {}),
		},
	});

	if (!(upstream.ok || upstream.status === 206)) {
		const status = upstream.status || 502;
		return NextResponse.json({ error: 'Fetch denied' }, { status });
	}

	const headers = new Headers();
	const passthrough = [
		'content-type',
		'content-length',
		'accept-ranges',
		'content-range',
		'etag',
		'last-modified',
	];

	passthrough.forEach((headerName) => {
		const value = upstream.headers.get(headerName);

		if (value) headers.set(headerName, value);
	});

	headers.set('Cache-Control', 'private, no-store');

	return new NextResponse(upstream.body, {
		status: upstream.status,
		headers,
	});
}
