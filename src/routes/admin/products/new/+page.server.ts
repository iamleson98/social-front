import { pageRequiresAuthentication } from "$lib/api/client";

export const load = async (event) => {
	await pageRequiresAuthentication(event);
	return {
		meta: {
			title: 'New Product'
		}
	}
};
