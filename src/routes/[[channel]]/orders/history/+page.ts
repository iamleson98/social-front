import { AppRoute } from '$lib/utils';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

/** The orders history list lives in the account area (`settings/orders`). Redirect there. */
export const load: PageLoad = () => {
	redirect(307, AppRoute.MY_ORDERS());
};
