import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get('code');

	if (!code) {
		return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
	}

	const supabase = await createSupabaseServerClient();
	const { error } = await supabase.auth.exchangeCodeForSession(code);

	if (error) {
		return NextResponse.redirect(
			new URL('/auth/login?error=email-confirmation', requestUrl.origin),
		);
	}

	return NextResponse.redirect(new URL('/', requestUrl.origin));
}
