import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function HeaderCta() {
	const supabase = await createSupabaseServerClient();
	const { data } = await supabase.auth.getClaims();

	const isLoggedIn = Boolean(data?.claims?.sub);

	return isLoggedIn ? (
		<Button asChild variant="outline" className="text-muted-foreground">
			<Link href="/my-courses">我的課程</Link>
		</Button>
	) : (
		<Button asChild>
			<Link href="/auth/login">登入</Link>
		</Button>
	);
}
