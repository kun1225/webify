import type {
	CoursesFilters,
	CoursesPriceFilterOption,
	CoursesSortOption,
} from '@/types';

export const DEFAULT_FILTERS: CoursesFilters = {
	page: 1,
	limit: 9,
	priceMin: 0,
	priceMax: undefined,
	sortBy: 'purchases',
	sortOrder: 'desc',
};

export const priceFilterOptions: {
	value: CoursesPriceFilterOption;
	label: string;
	filters: Partial<CoursesFilters>;
}[] = [
	{
		value: 'all',
		label: '全部價格',
		filters: { priceMin: 0, priceMax: undefined },
	},
	{
		value: 'free',
		label: '免費課程',
		filters: { priceMin: 0, priceMax: 0 },
	},
	{
		value: 'paid',
		label: '付費課程',
		filters: { priceMin: 0.01, priceMax: undefined },
	},
];

export const sortOptions: {
	value: CoursesSortOption;
	label: string;
	filters: Partial<CoursesFilters>;
}[] = [
	{
		value: 'popular',
		label: '最熱門',
		filters: { sortBy: 'purchases', sortOrder: 'desc' },
	},
	{
		value: 'newest',
		label: '最新',
		filters: { sortBy: 'created_at', sortOrder: 'desc' },
	},
	{
		value: 'price-asc',
		label: '價格由低到高',
		filters: { sortBy: 'price', sortOrder: 'asc' },
	},
	{
		value: 'price-desc',
		label: '價格由高到低',
		filters: { sortBy: 'price', sortOrder: 'desc' },
	},
];
