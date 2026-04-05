import { BackendHttpClient } from '$lib/utils/api';
import { type UserProfile } from '@mattermost/types/users';
import { writable } from 'svelte/store';

export type User = UserProfile & {
	profilePictureUrl: string;
};

export const createUserFromUserProfile = (userProfile: UserProfile | null) => {
	if (!userProfile) return null;

	const user: User = {
		...userProfile,
		profilePictureUrl: BackendHttpClient.getDefaultProfilePictureUrl(userProfile.id),
	};

	if (userProfile.last_picture_update) {
		user.profilePictureUrl = BackendHttpClient.getProfilePictureUrl(
			userProfile.id,
			userProfile.last_picture_update,
		);
	}
	return user;
};

export const UserStoreManager = (() => {
	const { set, subscribe } = writable<User | null>(null);

	return {
		subscribe,
		setValue: (value: UserProfile | null) => set(createUserFromUserProfile(value)),
	};
})();
