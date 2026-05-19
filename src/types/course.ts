import type { Tables, TablesInsert, TablesUpdate } from './database';
import type { CamelCasedProperties } from 'type-fest';
import type { LessonForCourseDetail } from './lesson';

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

export type CourseForCourseDetail = Pick<
	Course,
	| 'id'
	| 'title'
	| 'slug'
	| 'description'
	| 'coverImageUrl'
	| 'price'
	| 'duration'
	| 'purchases'
	| 'updatedAt'
	| 'isHidden'
> & {
	creator: string;
	lessons: LessonForCourseDetail[];
	isPurchased: boolean;
};

export type CourseForPurchased = Pick<
	Course,
	'id' | 'title' | 'slug' | 'coverImageUrl' | 'duration' | 'isHidden'
> & {
	creator: string;
};

export type CourseForCourses = Pick<
	Course,
	'id' | 'title' | 'slug' | 'coverImageUrl' | 'price' | 'creatorId' | 'duration'
> & { creator: string };

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
