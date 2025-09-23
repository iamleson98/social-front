import { dev } from '$app/environment';
import { HTTPStatusPermanentRedirect } from '$lib/utils/consts';
import { redirect } from '@sveltejs/kit';

// export const ssr = false;

export const load = async () => {
	if (!dev) {
		return redirect(HTTPStatusPermanentRedirect, '/');
	}

	return {
		meta: {
			title: 'Lab page - where developers showcase their experiments',
		},
	};
};
