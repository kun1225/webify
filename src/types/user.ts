export type UserRole = 'learner' | 'creator' | 'admin';

export type CurrentUserProfile = {
	id: string;
	full_name: string;
	role: UserRole;
};
