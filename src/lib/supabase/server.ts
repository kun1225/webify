'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error('supabase-server.ts: Missing Supabase environment variables');
}

export async function createSupabaseServerClient() {
	const cookieStore = await cookies();

	return createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
}

// persistSession: false is a setting for the Supabase JS Client, which means do not save the user's login session in the local browser (such as cookie, localStorage).
export async function createSupabaseAdminClient() {
	if (!supabaseSecretKey) {
		throw new Error('supabase-server.ts: Missing SUPABASE_SECRET_KEY');
	}

	return createClient(supabaseUrl!, supabaseSecretKey!, {
		auth: { persistSession: false },
	});
}
