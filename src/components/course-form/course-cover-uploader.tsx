'use client';

import { useState } from 'react';
import { uploadCourseCover } from '@/services/client/course';
import { cn } from '@/lib/utils';

import Image from 'next/image';
import { toast } from 'sonner';
import Dropzone from 'react-dropzone';

import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

import type { UpsertCourseFormData } from '@/services/shared/validations';
import type {
	ControllerRenderProps,
	FieldError as RhfFieldError,
} from 'react-hook-form';

export function CourseCoverUploader({
	field,
	error,
	disabled = false,
}: {
	field: ControllerRenderProps<UpsertCourseFormData, 'coverImageUrl'>;
	error?: RhfFieldError;
	disabled?: boolean;
}) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const onDrop = async (acceptedFiles: File[]) => {
		if (!acceptedFiles.length) return;
		const file = acceptedFiles[0];

		// Show preview immediately
		const reader = new FileReader();
		reader.onload = (e) => {
			const url = e.target?.result as string;
			setPreviewUrl(url);
		};
		reader.readAsDataURL(file);

		setIsUploading(true);

		toast.promise(
			async () => {
				try {
					const result = await uploadCourseCover(file);

					if (!result.ok) {
						throw new Error(result.message);
					}

					return result.data;
				} finally {
					setIsUploading(false);
				}
			},
			{
				loading: '封面圖片上傳中...',
				success: (data: string) => {
					field.onChange(data);
					return '封面圖片上傳成功';
				},
				error: (err: Error & { error?: string }) => {
					setPreviewUrl(null);
					return err.error || '上傳失敗，請稍後再試';
				},
			},
		);
	};

	const handleRemoveImage = async (e?: React.MouseEvent) => {
		if (e) e.stopPropagation();

		// For now, just remove the preview and notify parent
		// In a real implementation, you might want to pass the courseId to delete from storage
		setPreviewUrl(null);
		field.onChange('');
		toast.success('封面圖片已移除');
	};

	const displayUrl = previewUrl || field.value;

	return (
		<Field data-invalid={!!error}>
			<FieldLabel>課程封面</FieldLabel>
			<Dropzone
				onDrop={onDrop}
				accept={{
					'image/png': ['.png'],
					'image/jpeg': ['.jpg', '.jpeg'],
					'image/webp': ['.webp'],
				}}
				maxFiles={1}
				maxSize={20 * 1024 * 1024} // 20MB
				disabled={disabled || isUploading}
			>
				{({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
					<div className="group relative mx-auto w-full max-w-7xl">
						<button
							type="button"
							className={cn(
								'border-input group-hover:border-ring flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-8 transition-[color,border,box-shadow] outline-none',
								'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
								isDragActive && 'border-primary bg-primary-background',
								isDragReject && 'border-destructive bg-destructive-background',
								(disabled || isUploading) && 'cursor-not-allowed opacity-50',
								!!error && 'border-destructive',
							)}
							aria-disabled={disabled || isUploading}
							{...getRootProps()}
						>
							{displayUrl ? (
								<Image
									src={displayUrl}
									alt="課程封面預覽"
									fill
									className="rounded-lg object-cover"
									unoptimized={displayUrl.startsWith('blob:')}
								/>
							) : (
								<>
									<div className="text-muted-foreground flex flex-col items-center gap-4 text-center">
										<ImageIcon className="text-muted-foreground size-12" />

										<div className="flex items-center gap-2">
											<Upload className="size-4" />
											<p className="t-body-3 font-medium">點擊或拖曳上傳封面</p>
										</div>

										<p className="t-body-4 text-pretty">
											支援 PNG、JPEG、WebP 格式，建議 16:9 比例，檔案大小限制
											20MB
										</p>
									</div>
								</>
							)}
						</button>

						<input
							{...getInputProps({
								name: field.name,
								onBlur: field.onBlur,
							})}
						/>

						{displayUrl && !isUploading && !disabled && (
							<Button
								type="button"
								variant="destructive"
								size="icon-sm"
								className="text-destructive-foreground absolute -top-2 -right-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								onClick={handleRemoveImage}
							>
								<X />
							</Button>
						)}
					</div>
				)}
			</Dropzone>
			<FieldError errors={[error]} />
		</Field>
	);
}
