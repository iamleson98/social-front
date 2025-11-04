import { GRAPHQL_CLIENT } from '$lib/api/client';
import type {
  Query,
} from '$lib/gql/graphql';
import { getMiddleAccountAccessToken } from '$lib/utils/server-side-only.js';
import { json } from '@sveltejs/kit';
import { CHANNELS_QUERY } from '$lib/api/channels';


export const GET = async () => {
  const token = await getMiddleAccountAccessToken();

  if (token == null)
    return json({
      channels: [],
    });

  const result = await GRAPHQL_CLIENT.query<Pick<Query, 'channels'>>(
    CHANNELS_QUERY,
    { variables: {} },
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
      channels: [],
    });

  return json({
    channels: result.data?.channels || [],
  });
};
