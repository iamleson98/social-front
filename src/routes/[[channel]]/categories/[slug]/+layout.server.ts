import { error } from "@sveltejs/kit";
import { CHANNEL_KEY, HTTPStatusBadRequest, HTTPStatusServerError } from "$lib/utils/consts";
import validator from 'validator';
import { serverSideTranslate } from "$i18n";
import { performServerSideGraphqlRequest } from "$lib/api/client";
import type { Query } from "$lib/gql/graphql";
import { CATEGORY_DETAIL_QUERY } from "$lib/api";
import type { CategoryDetailQueryArgs } from "$lib/api/product";
import { DEFAULT_CHANNEL } from "$lib/utils/channels.js";


export const load = async (event) => {
  const slug = event.params.slug.trim();

  if (!slug || !validator.isSlug(slug)) {
    return error(HTTPStatusBadRequest, {
      message: await serverSideTranslate(event, 'error.invalidSlug'),
    });
  }

  const channelSlug = event.cookies.get(CHANNEL_KEY) || DEFAULT_CHANNEL.slug;

  const categoryResult = await performServerSideGraphqlRequest<Pick<Query, 'category'>, CategoryDetailQueryArgs>(
    'query',
    CATEGORY_DETAIL_QUERY,
    {
      slug,
      productChannel: channelSlug,
    },
    event,
  );

  if (categoryResult.error) {
    return error(HTTPStatusServerError, {
      message: await serverSideTranslate(event, 'error.failedToLoad'),
    });
  }

  return {
    meta: {
      title: categoryResult.data?.category?.name,
    },
    category: categoryResult.data?.category,
  };
};
