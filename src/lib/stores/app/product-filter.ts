import { OrderDirection, ProductOrderField, type QueryProductsArgs } from '$lib/gql/graphql';
import { getCookieByKey } from '$lib/utils';
import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
import { writable } from 'svelte/store';


export type ProductFilterParams = QueryProductsArgs & {
  /** indicate that the product list section must reload */
  reload: boolean
};

/** this store keeps track of products filter options  */
export const productFilterParamStore = writable<ProductFilterParams>({
  channel: getCookieByKey(CHANNEL_KEY) || defaultChannel.slug,
  first: 10,
  sortBy: {
    field: ProductOrderField.Price,
    direction: OrderDirection.Asc,
  },
  filter: {
    price: {},
    giftCard: false,
  },
  reload: false,
});

