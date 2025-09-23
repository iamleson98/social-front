import type { Category } from '$lib/gql/graphql.js';

export const load = async (evt) => {
	return (await evt.parent()) as { category: Category };
};
