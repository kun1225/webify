'use client';

import Image from 'next/image';
import { useState } from 'react';

import Dropzone from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, X, User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { uploadAvatar, deleteUserAvatar } from '@/services/client/user';

import { Button } from '@/components/ui/button';

export function ProfileFormAvatarUploader({
	currentAvatarUrl,
	disabled = false,
}: {
	currentAvatarUrl?: string;
	disabled?: boolean;
}) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		currentAvatarUrl || null,
	);

	const onDrop = async (acceptedFiles: File[]) => {
		if (!acceptedFiles.length) return;
		const file = acceptedFiles[0];

		const reader = new FileReader();
		reader.onload = (e) => setPreviewUrl(e.target?.result as string);
		reader.readAsDataURL(file);

		setIsUploading(true);
		const res = await uploadAvatar(file);

		if (res.ok) {
			toast.success('上傳成功！');
		} else {
			toast.error('上傳失敗');
		}

		setIsUploading(false);
	};

	const handleRemoveAvatar = async (e?: React.MouseEvent) => {
		if (e) e.stopPropagation();

		setIsUploading(true);
		const res = await deleteUserAvatar();

		if (res.ok) {
			toast.success('頭像刪除成功');

			setPreviewUrl(null);
		} else {
			toast.error('刪除失敗，請稍後再試');
		}

		setIsUploading(false);
	};

	return (
		<div className="flex w-fit flex-col items-center gap-2">
			<Dropzone
				onDrop={onDrop}
				accept={{
					'image/png': ['.png'],
					'image/jpeg': ['.jpg', '.jpeg'],
					'image/webp': ['.webp'],
				}}
				maxFiles={1}
				maxSize={5 * 1024 * 1024}
				disabled={disabled || isUploading}
			>
				{({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
					<div className="group relative">
						<button
							{...getRootProps()}
							type="button"
							className={cn(
								'border-input group-hover:border-ring flex w-full cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 transition-[color,border,box-shadow] outline-none',
								'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
								isDragActive && 'border-primary bg-primary-background',
								isDragReject && 'border-destructive bg-destructive-background',
								(disabled || isUploading) && 'cursor-not-allowed opacity-50',
							)}
							aria-disabled={disabled || isUploading}
						>
							<div className="relative">
								<div className="bg-muted flex size-24 items-center justify-center overflow-hidden rounded-full">
									{previewUrl ? (
										<Image
											src={previewUrl}
											alt="頭像預覽"
											width={96}
											height={96}
											className="size-full object-cover"
											unoptimized={previewUrl.startsWith('blob:')}
										/>
									) : (
										<User className="text-muted-foreground size-12" />
									)}
								</div>
							</div>

							<div className="text-muted-foreground text-center">
								<div className="flex flex-col items-center gap-2">
									<div className="flex items-center gap-2">
										<Upload className="size-3.5" />
										<p className="t-body-3 font-bold">
											{previewUrl ? '點擊或拖曳更換頭像' : '點擊或拖曳上傳頭像'}
										</p>
									</div>
									<p className="text-muted-foreground t-body-4">
										支援 PNG、JPEG、WebP 格式
									</p>
								</div>
							</div>

							<input {...getInputProps()} />
						</button>

						{previewUrl && !isUploading && !disabled && (
							<Button
								type="button"
								variant="destructive"
								size="icon-sm"
								className="text-destructive-foreground absolute -top-2 -right-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								onClick={handleRemoveAvatar}
							>
								<X />
							</Button>
						)}
					</div>
				)}
			</Dropzone>

			<p className="text-muted-foreground t-body-4 text-center">
				檔案大小限制 5MB，建議尺寸 512x512px
			</p>
		</div>
	);
}
