import type { Tables } from './database';
import type { CamelCasedProperties } from 'type-fest';

export type CourseForStudioDB = Pick<
	Tables<'courses'>,
	| 'id'
	| 'title'
	| 'slug'
	| 'price'
	| 'purchases'
	| 'cover_image_url'
	| 'is_hidden'
	| 'updated_at'
	| 'created_at'
>;

export type CourseForStudio = CamelCasedProperties<CourseForStudioDB>;

export type CourseForCourses = {
	id: string;
	title: string;
	slug: string;
	coverImageUrl: string;
	price: number;
	creator: string;
	duration: number;
};

export type CoursesFilters = {
	page: number;
	limit: number;
	priceMin?: number;
	priceMax?: number;
	sortBy?: 'created_at' | 'price' | 'purchases';
	sortOrder?: 'asc' | 'desc';
};

export type CoursesPriceFilterOption = 'all' | 'free' | 'paid';
export type CoursesSortOption =
	| 'newest'
	| 'price-asc'
	| 'price-desc'
	| 'popular';

export type CoursesPagination = {
	total: number;
	totalPages: number;
};

export type CoursesWithPagination = {
	courses: CourseForCourses[];
	pagination: CoursesPagination;
	hasMore: boolean;
};
