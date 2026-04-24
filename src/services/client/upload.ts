'use client';

type MimeToExtensionMap = Record<string, string>;

export function getFileExtension(
	file: File,
	mimeToExtension: MimeToExtensionMap,
) {
	return mimeToExtension[file.type] ?? null;
}

export function validateUploadFile(
	file: File,
	{
		maxFileSize,
		maxFileSizeLabel,
		mimeToExtension,
	}: {
		maxFileSize: number;
		maxFileSizeLabel: string;
		mimeToExtension: MimeToExtensionMap;
	},
) {
	if (!file) {
		return '缺少檔案';
	}

	if (!(file.type in mimeToExtension)) {
		return '僅支援 PNG、JPEG、WebP 格式';
	}

	if (file.size > maxFileSize) {
		return `檔案大小不可超過 ${maxFileSizeLabel}`;
	}

	return null;
}
