'use server';

import camelcaseKeys from 'camelcase-keys';
import { redirect } from 'next/navigation';
import {
	createSupabaseAdminClient,
	createSupabaseServerClient,
} from '@/lib/supabase/server';

import { LoginFormData, SignUpFormData } from '@/services/shared/validations';

import { AppError, type Result } from '@/types';
import type {
	AuthResponse,
	AuthTokenResponsePassword,
} from '@supabase/supabase-js';

import type { UserProfile, UserProfileDB } from '@/types';

export async function login(
	data: LoginFormData,
): Promise<Result<AuthTokenResponsePassword['data']>> {
	const supabase = await createSupabaseServerClient();

	const { data: authData, error } =
		await supabase.auth.signInWithPassword(data);

	if (error) {
		if (error.code === 'invalid_credentials') {
			return {
				ok: false,
				code: AppError.UNAUTHENTICATED,
				message: '帳號或密碼不正確',
			};
		}

		return {
			ok: false,
			code: AppError.INTERNAL,
			message: '登入失敗，請稍後再試',
		};
	}

	return {
		ok: true,
		data: authData,
	};
}

export async function signup(
	data: SignUpFormData,
): Promise<Result<AuthResponse['data']>> {
	const { email, password } = data;

	const supabase = await createSupabaseServerClient();
	const adminClient = await createSupabaseAdminClient();

	const baseUserName = email.split('@')[0];

	const { data: existingUsers } = await adminClient
		.from('users')
		.select('full_name')
		.or(`full_name.eq.${baseUserName},full_name.like.${baseUserName}-%`);

	let count = 1;
	let signupUserName = email.split('@')[0];
	const existingUsersName = existingUsers?.map((user) => user.full_name) ?? [];

	while (existingUsersName.includes(signupUserName)) {
		signupUserName = `${baseUserName}-${count}`;
		count++;
	}

	const { data: authData, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				full_name: signupUserName,
			},
		},
	});

	if (error) {
		console.error(error);

		if (error.message.includes('User already registered')) {
			return {
				ok: false,
				code: AppError.FORBIDDEN,
				message: 'Email 已註冊，請使用其他 Email 註冊',
			};
		} else {
			return {
				ok: false,
				code: AppError.INTERNAL,
				message: '註冊失敗，請稍後再試',
			};
		}
	}

	return {
		ok: true,
		data: authData,
	};
}

export async function signOut(): Promise<void> {
	const supabase = await createSupabaseServerClient();
	await supabase.auth.signOut();
	redirect('/');
}

export async function getCurrentUserProfile(): Promise<Result<UserProfile>> {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return {
			ok: false,
			code: AppError.UNAUTHENTICATED,
			message: '請先登入',
		};
	}

	const { data: profile, error: profileError } = await supabase
		.from('users')
		.select('id, full_name, role, avatar_url, updated_at')
		.eq('id', user.id)
		.single<
			UserProfileDB & {
				updated_at: string | null;
			}
		>();

	if (profileError) {
		return {
			ok: false,
			code: AppError.INTERNAL,
			message: '無法取得使用者資料',
		};
	}

	let avatarUrl: string | null = null;

	if (profile?.avatar_url) {
		const { data } = supabase.storage
			.from('avatars')
			.getPublicUrl(profile.avatar_url);

		const bust = profile.updated_at
			? `?t=${encodeURIComponent(profile.updated_at)}`
			: '';
		avatarUrl = `${data.publicUrl}${bust}`;
	}

	return {
		ok: true,
		data: camelcaseKeys({
			...profile,
			avatar_url: avatarUrl,
		}),
	};
}
