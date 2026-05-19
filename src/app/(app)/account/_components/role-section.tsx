'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Award, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import type { UserProfile } from '@/types';
import { RoleSectionPlanComparison } from './role-section-plan-comparison';
import { AppError } from '@/types/result';

export function RoleSection({ user }: { user: UserProfile }) {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const isCreator = user.role === 'creator';

	const handleLifetimeUpgrade = async () => {
		setIsLoading(true);

		const response = await fetch('/api/checkout-sessions', {
			method: 'POST',
			body: JSON.stringify({
				cancelUrl: '/account',
				metadata: {
					purchase_type: 'lifetime_creator',
				},
			}),
		});

		const res = await response.json();

		if (!res.ok) {
			switch (res.code) {
				case AppError.UNAUTHENTICATED:
					toast.error('請先登入帳號');
					router.push('/auth/login');
					break;
				default:
					console.error('handleLifetimeUpgrade ~ res:', res);
					toast.error('升級失敗，請稍後再試');
					break;
			}

			setIsLoading(false);
			return;
		}

		setIsDialogOpen(false);

		const { url } = res.data;
		if (url) {
			toast.success('前往付款頁');
			router.push(url as Route);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<Card
				className={cn(
					isCreator
						? 'border-success-border bg-success-background'
						: 'border-primary-border bg-primary-background',
				)}
			>
				<CardContent className="flex items-center gap-6">
					{isCreator ? (
						<CircleCheck className="text-success size-6" />
					) : (
						<Award className="text-primary size-6" />
					)}

					<div
						className={cn(
							isCreator
								? 'text-success-background-foreground'
								: 'text-primary-background-foreground',
						)}
					>
						<p className="font-bold">
							{isCreator ? '創作者狀態：' : '升級為創作者'}
						</p>
						<p className="mt-px">
							{isCreator
								? '您已經是創作者，可以開始創建課程了！'
								: '解鎖創建和銷售課程的功能'}
						</p>
					</div>

					{!isCreator && (
						<Button className="ml-8" onClick={() => setIsDialogOpen(true)}>
							立即升級
						</Button>
					)}
				</CardContent>
			</Card>

			{!isCreator && (
				<DialogContent>
					<DialogHeader>
						<DialogTitle>選擇升級方案</DialogTitle>
						<DialogDescription>
							終生創作者方案才可創作與上架課程，免費方案仍可瀏覽與收藏內容。
						</DialogDescription>
					</DialogHeader>

					<RoleSectionPlanComparison
						isCreator={isCreator}
						onUpgrade={handleLifetimeUpgrade}
						isUpgrading={isLoading}
					/>
				</DialogContent>
			)}
		</Dialog>
	);
}
