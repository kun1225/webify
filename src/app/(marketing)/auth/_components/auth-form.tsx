'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { login, signup } from '@/services/server/auth';

import { LoaderCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldLabel,
	FieldError,
	FieldGroup,
} from '@/components/ui/field';
import {
	loginSchema,
	signUpSchema,
	type LoginFormData,
	type SignUpFormData,
} from '@/services/shared/validations';
import { toast } from 'sonner';

const texts = {
	login: {
		title: '登入你的帳號',
		subtitle: '或',
		linkText: '註冊新帳號',
		linkHref: '/auth/signup',
		buttonText: '登入',
		bottomText: '還沒有帳號？',
		bottomLinkText: '立即註冊',
		bottomLinkHref: '/auth/signup',
	},
	signup: {
		title: '註冊新帳號',
		subtitle: '或',
		linkText: '登入現有帳號',
		linkHref: '/auth/login',
		buttonText: '註冊',
		bottomText: '已有帳號？',
		bottomLinkText: '立即登入',
		bottomLinkHref: '/auth/login',
	},
};

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
	const isLogin = mode === 'login';
	const schema = isLogin ? loginSchema : signUpSchema;
	const currentTexts = texts[mode];

	const router = useRouter();

	const form = useForm<LoginFormData | SignUpFormData>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		defaultValues: isLogin
			? { email: '', password: '' }
			: { email: '', password: '', confirmPassword: '' },
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = form;

	const [globalError, setGlobalError] = useState<string | null>(null);

	const onSubmit = async (data: LoginFormData | SignUpFormData) => {
		setGlobalError(null);

		const result = isLogin
			? await login(data as LoginFormData)
			: await signup(data as SignUpFormData);

		if (result.ok) {
			toast(isLogin ? '登入成功！' : '註冊成功！請到信箱驗證您的帳號');
			router.replace('/my-courses');
		} else {
			setGlobalError(result.message);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md">
				<header>
					<h2 className="mt-6 text-center text-3xl font-extrabold">
						{currentTexts.title}
					</h2>
					<p className="text-muted-foreground mt-2 text-center text-sm">
						{currentTexts.subtitle}{' '}
						<Link
							href={currentTexts.linkHref}
							className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
						>
							{currentTexts.linkText}
						</Link>
					</p>
				</header>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					{/* Global Error */}
					{globalError ? (
						<div
							className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
							role="alert"
							aria-live="polite"
						>
							{globalError}
						</div>
					) : null}

					<FieldGroup>
						{/* Email */}
						<Field>
							<FieldLabel htmlFor="email">電子郵件</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="請輸入您的電子郵件"
								aria-invalid={!!errors.email}
								{...register('email')}
							/>
							<FieldError errors={[errors.email]} />
						</Field>

						{/* Password */}
						<Field>
							<FieldLabel htmlFor="password">密碼</FieldLabel>
							<Input
								id="password"
								type="password"
								autoComplete={isLogin ? 'current-password' : 'new-password'}
								placeholder={
									isLogin ? '請輸入您的密碼' : '請輸入密碼（至少 6 個字元）'
								}
								aria-invalid={!!errors.password}
								{...register('password')}
							/>
							<FieldError errors={[errors.password]} />
						</Field>

						{/* Confirm Password */}
						{!isLogin && (
							<Field>
								<FieldLabel htmlFor="confirmPassword">確認密碼</FieldLabel>
								<Input
									id="confirmPassword"
									type="password"
									autoComplete="new-password"
									placeholder="請再次輸入密碼"
									aria-invalid={
										!!(errors as { confirmPassword?: { message?: string } })
											.confirmPassword
									}
									{...register('confirmPassword')}
								/>
								<FieldError
									errors={[
										(errors as { confirmPassword?: { message?: string } })
											.confirmPassword,
									]}
								/>
							</Field>
						)}
					</FieldGroup>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? (
							<>
								<LoaderCircle className="animate-spin" />
								<span>{currentTexts.buttonText}中...</span>
							</>
						) : (
							<>{currentTexts.buttonText}</>
						)}
					</Button>

					<div className="text-center">
						<p className="text-muted-foreground text-sm">
							{currentTexts.bottomText}{' '}
							<Link
								href={currentTexts.bottomLinkHref}
								className="text-primary hover:text-primary/80 font-medium transition-colors"
							>
								{currentTexts.bottomLinkText}
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
