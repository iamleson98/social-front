import { GRAPHQL_CLIENT, isAuthenError } from '$lib/api/client';
import { PROMOTIONS_QUERY } from '$lib/api/discount';
import type {
	PromotionCountableConnection,
	Query,
	QueryPromotionsArgs,
} from '$lib/gql/graphql';
import { getMiddleAccountAccessToken, tryRefreshToken } from '$lib/utils/server-side-only.js';
import { json } from '@sveltejs/kit';


export const POST = async (event) => {
	const body: QueryPromotionsArgs = await event.request.json();

	let token = await getMiddleAccountAccessToken();

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

	for (let tr = 0; tr < 3; tr++) {
		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'promotions'>, QueryPromotionsArgs>(
			PROMOTIONS_QUERY,
			body,
			{
				fetchOptions: {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
				requestPolicy: 'network-only',
			},
		);

		if (result.error) {
			if (isAuthenError(result.error)) {
				token = await tryRefreshToken();
				continue;
			} else
				return json({
					promotions: {
						edges: [],
						pageInfo: {
							hasNextPage: false,
							hasPreviousPage: false,
						},
					} satisfies PromotionCountableConnection,
				});
		}

		return json({
			promotions: result.data?.promotions,
		});
	}

	return json({
		promotions: [],
	});
};
