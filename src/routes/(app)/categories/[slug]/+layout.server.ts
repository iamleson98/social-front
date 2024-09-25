import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { CHANNEL_KEY, defaultChannel, HTTPStatusBadRequest, HTTPStatusServerError } from "$lib/utils/consts";
import validator from 'validator';
import { tServer } from "$i18n";
import { performBackendOperation } from "$lib/client";
import { CATEGORY_DETAIL_QUERY_STORE } from "$lib/stores/api";
import type { Query, QueryCategoryArgs } from "$lib/gql/graphql";
import type { CategoryDetailQueryArgs } from "$lib/stores/api/product";


export const load: LayoutServerLoad = async (event) => {
  const slug = event.params.slug.trim();

  if (!slug || !validator.isSlug(slug)) {
    return error(HTTPStatusBadRequest, {
      message: tServer(event, 'error.invalidSlug'),
    });
  }

  const channelSlug = event.cookies.get(CHANNEL_KEY) || defaultChannel.slug;

  const categoryResult = await performBackendOperation<Pick<Query, 'category'>, CategoryDetailQueryArgs>(
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
      message: tServer(event, 'error.failedToLoad'),
    });
  }

  return {
    meta: {
      title: categoryResult.data?.category?.name,
    },
    category: categoryResult.data?.category,
  };
};
