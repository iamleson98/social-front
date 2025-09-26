import { invalidateAll } from '$app/navigation';
import { UserStoreManager } from '$lib/stores/auth';
import { HTTPStatusSuccess } from './consts';
import { AppRoute } from './routes';
import { toast } from 'svelte-sonner';

export const handleLogout = async (
	translationFunc: (key: string, args?: Record<string, unknown>) => string,
) => {
	const result = await fetch(AppRoute.AUTH_SIGNOUT(), { method: 'POST' });
	const parsedResult = await result.json();

	if (parsedResult.status !== HTTPStatusSuccess) {
		toast.error(translationFunc('error.errorOccured'));
		return;
	}

	UserStoreManager.setValue(null);
	await invalidateAll();
};
