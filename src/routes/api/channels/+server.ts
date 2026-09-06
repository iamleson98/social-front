import { GRAPHQL_CLIENT } from '$lib/api/client';
import type { Query } from '$lib/gql/graphql';
import {
	forbiddenJson,
	getMiddleAccountAccessToken,
	isSameOriginRequest,
	rateLimit,
	tooManyRequestsJson,
} from '$lib/utils/server-side-only.js';
import { json } from '@sveltejs/kit';
import { CHANNELS_QUERY } from '$lib/api/channels';
import type { RequestEvent } from './$types';

export const GET = async (event: RequestEvent) => {
	// This endpoint signs in with a privileged service account internally:
	// only same-origin calls are allowed and the rate is capped per client.
	if (!isSameOriginRequest(event)) return forbiddenJson();
	if (!rateLimit(`channels:${event.getClientAddress()}`, 30, 60_000)) return tooManyRequestsJson();

	const token = await getMiddleAccountAccessToken();

	if (token == null)
		return json({
			channels: [],
		});

	const result = await GRAPHQL_CLIENT.query<Pick<Query, 'channels'>>(CHANNELS_QUERY, {}, {
		fetchOptions: {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
		requestPolicy: 'network-only',
	});

	if (result.error)
		return json({
			channels: [],
		});

	return json({
		channels: result.data?.channels || [],
	});
};
