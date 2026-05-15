'use client';

import { useState } from 'react';
import Dropzone, { type FileRejection } from 'react-dropzone';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';

import { Upload, VideoIcon, X } from 'lucide-react';

import type {
	ControllerRenderProps,
	FieldError as RhfFieldError,
} from 'react-hook-form';
import type { UpdateLessonFormData } from '@/services/shared/validations';

const MAX_VIDEO_FILE_SIZE = 50 * 1024 * 1024;

export function LessonFormVideo({
	field,
	error,
	lessonId,
	onDropRejected,
	onDropAccepted,
	onRemoveVideo,
	disabled = false,
}: {
	field: ControllerRenderProps<UpdateLessonFormData, 'videoUrl'>;
	error?: RhfFieldError;
	lessonId: string;
	onDropRejected?: (errors: FileRejection[]) => void;
	onDropAccepted?: (files: File[]) => void;
	onRemoveVideo?: () => void;
	disabled?: boolean;
}) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const onDrop = async (acceptedFiles: File[]) => {
		if (!acceptedFiles.length) return;

		const file = acceptedFiles[0];

		const reader = new FileReader();
		reader.onload = (event) => {
			setPreviewUrl((event.target?.result as string) || null);
		};
		reader.readAsDataURL(file);

		setIsUploading(true);
		setUploadProgress(0);

		// TODO: replace simulated progress with real upload logic.
		for (let progress = 0; progress <= 100; progress += 10) {
			setUploadProgress(progress);
			await new Promise((resolve) => setTimeout(resolve, 80));
		}

		// TODO: after connecting upload API, persist the returned storage path.
		field.onChange(`pending-upload:${lessonId}:${file.name}`);
		setIsUploading(false);
	};

	const handleRemoveVideo = async () => {
		setIsUploading(true);

		// TODO: remove the uploaded video from storage after lesson video API is ready.
		await new Promise((resolve) => setTimeout(resolve, 200));

		setPreviewUrl(null);
		setUploadProgress(0);
		field.onChange('');
		onRemoveVideo?.();
		setIsUploading(false);
	};

	return (
		<Field data-invalid={!!error}>
			<FieldLabel htmlFor={field.name}>課程影片</FieldLabel>

			<Dropzone
				onDrop={onDrop}
				accept={{
					'video/mp4': ['.mp4'],
					'video/webm': ['.webm'],
				}}
				maxFiles={1}
				maxSize={MAX_VIDEO_FILE_SIZE}
				disabled={disabled || isUploading || !!previewUrl}
				onDropAccepted={(files) => {
					onDropAccepted?.(files);
				}}
				onDropRejected={(errors) => {
					onDropRejected?.(errors);
				}}
			>
				{({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
					<div className="group relative mx-auto w-full max-w-4xl">
						<button
							type="button"
							className={cn(
								'border-input group-hover:border-ring flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed transition-[color,border,box-shadow] outline-none',
								'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
								isDragActive && 'border-primary bg-primary-background',
								isDragReject && 'border-destructive bg-destructive-background',
								(disabled || isUploading) && 'cursor-not-allowed opacity-50',
							)}
							aria-disabled={disabled || isUploading}
							{...getRootProps()}
						>
							{previewUrl ? (
								<div className="relative aspect-video w-full">
									<video
										src={previewUrl}
										className="h-full w-full rounded-lg object-cover"
										controls
									/>

									{isUploading && (
										<div className="text-muted absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80 text-center">
											<p className="mb-1">上傳中... {uploadProgress}%</p>
											<p className="t-body-4 mb-2">請勿關閉此頁面</p>
											<div className="h-2 w-32 overflow-hidden rounded-full bg-white/20">
												<div
													className="h-full bg-white transition-all duration-50"
													style={{ width: `${uploadProgress}%` }}
												/>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-muted-foreground flex flex-col items-center gap-4 text-center">
									<VideoIcon className="size-12" />

									<div className="flex items-center gap-2">
										<Upload className="size-4" />
										<p className="t-body-3 font-medium">點擊或拖曳上傳影片</p>
									</div>

									<p className="t-body-4 text-pretty">
										只支援 MP4、WebM 格式，建議 16:9 比例，檔案大小限制 50MB
									</p>
								</div>
							)}
						</button>

						<input {...getInputProps()} />

						{!!previewUrl && !isUploading && !disabled && (
							<Button
								type="button"
								variant="destructive"
								size="icon-sm"
								className="text-destructive-foreground absolute -top-2 -right-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								onClick={handleRemoveVideo}
							>
								<X />
							</Button>
						)}
					</div>
				)}
			</Dropzone>

			<FieldDescription>
				這一章先完成前端互動，真正的 storage 與影片播放會在下一章補上
			</FieldDescription>
			<FieldError errors={[error]} />
		</Field>
	);
}
