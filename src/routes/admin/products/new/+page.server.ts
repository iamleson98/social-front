import { pageRequiresAuthentication } from "$lib/client";
import type { PageServerLoad } from "./$types";

// we dont need SSR here, disabling it here also help date picker component to work
export const ssr = false;

export const load: PageServerLoad = async (event) => {
	await pageRequiresAuthentication(event);
	return {
		meta: {
			title: 'New Product'
		}
	}
};
