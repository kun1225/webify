import type { Tables, TablesInsert, TablesUpdate } from './database';
import type { CamelCasedProperties } from 'type-fest';

export type Course = CamelCasedProperties<Tables<'courses'>>;
export type InsertCourseDB = TablesInsert<'courses'>;
export type UpdateCourseDB = TablesUpdate<'courses'>;

export type CourseForStudio = Pick<
	Course,
	| 'id'
	| 'title'
	| 'slug'
	| 'price'
	| 'purchases'
	| 'coverImageUrl'
	| 'isHidden'
	| 'updatedAt'
	| 'createdAt'
>;

export type CourseForEdit = Pick<
	Course,
	| 'id'
	| 'title'
	| 'slug'
	| 'description'
	| 'coverImageUrl'
	| 'price'
	| 'duration'
	| 'isHidden'
>;

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
