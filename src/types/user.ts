import type { Tables } from './database';
import type { CamelCasedProperties } from 'type-fest';

export type UserProfileDB = Pick<
	Tables<'users'>,
	'id' | 'full_name' | 'role' | 'avatar_url'
>;

export type UserProfile = CamelCasedProperties<UserProfileDB>;
