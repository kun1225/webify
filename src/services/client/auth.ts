'use client';

import type { User } from '@supabase/supabase-js';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AppError, type Result } from '@/types';

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

export async function requireBrowserUser(): Promise<
	Result<{ supabase: BrowserSupabaseClient; user: User }>
> {
	const supabase = createSupabaseBrowserClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: authError?.message || '用戶未登入',
		};
	}

	return {
		ok: true,
		data: {
			supabase,
			user,
		},
	};
}
