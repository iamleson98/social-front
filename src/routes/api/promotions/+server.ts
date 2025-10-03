import { GRAPHQL_CLIENT } from '$lib/api/client';
import { PROMOTIONS_QUERY } from '$lib/api/discount';
import type {
	PromotionCountableConnection,
	Query,
	QueryPromotionsArgs,
} from '$lib/gql/graphql';
import { getmiddleAccountAccessToken } from '$lib/utils/server-side-only.js';
import { json } from '@sveltejs/kit';


export const POST = async (event) => {
	const body: QueryPromotionsArgs = await event.request.json();

	const token = await getmiddleAccountAccessToken();
	if (token == null)
		return json({
			promotions: {
				edges: [],
				pageInfo: {
					hasNextPage: false,
					hasPreviousPage: false,
				},
			} satisfies PromotionCountableConnection,
		});

	const result = await GRAPHQL_CLIENT.query<Pick<Query, 'promotions'>, QueryPromotionsArgs>(
		PROMOTIONS_QUERY,
		body,
		{
			fetchOptions: {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		},
	);
	if (result.error)
		return json({
			promotions: {
				edges: [],
				pageInfo: {
					hasNextPage: false,
					hasPreviousPage: false,
				},
			} satisfies PromotionCountableConnection,
		});

	return json({
		promotions: result.data?.promotions,
	});
};
