import { graphqlClient } from "$lib/client";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	await graphqlClient.pageRequiresAuthentication(event);
	return {
		meta: {
			title: 'New Product'
		}
	};
};
