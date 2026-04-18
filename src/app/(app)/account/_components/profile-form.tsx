'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { updateUserProfile } from '@/services/server/user';

import {
	profileSchema,
	type ProfileFormData,
} from '@/services/shared/validations';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { FormButton } from '@/components/form-button';
import { toast } from 'sonner';

import type { UserProfile } from '@/types';

export function ProfileForm({ user }: { user: UserProfile }) {
	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: user.fullName || '',
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty, isSubmitting },
	} = form;

	const onSubmit = async (data: ProfileFormData) => {
		const result = await updateUserProfile(data);

		if (!result.ok) {
			toast.error(result.message);
		} else {
			toast.success('更新成功');
			form.reset(data);
		}
	};

	return (
		<Card className="t-body-1">
			<CardHeader>
				<CardTitle>個人資料</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FieldGroup>
						<Field data-invalid={!!errors.fullName}>
							<FieldLabel htmlFor="full_name">姓名</FieldLabel>
							<Input
								id="full_name"
								placeholder="請輸入您的姓名"
								aria-invalid={!!errors.fullName}
								{...register('fullName')}
							/>
							<FieldError errors={[errors.fullName]} />
						</Field>
					</FieldGroup>

					<FormButton
						isLoading={isSubmitting}
						disabled={!isDirty || isSubmitting}
						label="更新資料"
					/>
				</form>
			</CardContent>
		</Card>
	);
}
