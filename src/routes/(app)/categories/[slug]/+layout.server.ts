import { error } from "@sveltejs/kit";
import { CHANNEL_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError } from "$lib/utils/consts";
import validator from 'validator';
import { tranFunc } from "$i18n";
import { performServerSideGraphqlRequest } from "$lib/client";
import { CATEGORY_DETAIL_QUERY_STORE } from "$lib/stores/api";
import type { Query } from "$lib/gql/graphql";
import type { CategoryDetailQueryArgs } from "$lib/stores/api/product";
import { get } from "svelte/store";


export const load = async (event) => {
  const slug = event.params.slug.trim();

  if (!slug || !validator.isSlug(slug)) {
    return error(HTTPStatusBadRequest, {
      message: get(tranFunc)('error.invalidSlug'),
    });
  }

  const channelSlug = event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;

  const categoryResult = await performServerSideGraphqlRequest<Pick<Query, 'category'>, CategoryDetailQueryArgs>(
    'query',
    CATEGORY_DETAIL_QUERY_STORE,
    {
      slug,
      productChannel: channelSlug,
    },
    event,
  );

  if (categoryResult.error) {
    return error(HTTPStatusServerError, {
      message: get(tranFunc)('error.failedToLoad'),
    });
  }

  return {
    meta: {
      title: categoryResult.data?.category?.name,
    },
    category: categoryResult.data?.category,
  };
};
