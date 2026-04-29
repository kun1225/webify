import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		'supabase-browser.ts: Missing Supabase environment variables',
	);
}

export function createSupabaseBrowserClient() {
	return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
