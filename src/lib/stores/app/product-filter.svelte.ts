import { OrderDirection, ProductOrderField, type QueryProductsArgs } from '$lib/gql/graphql';
import { writable } from 'svelte/store';
import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
import { CHANNEL_KEY } from '$lib/utils/consts';
import { DEFAULT_CHANNEL } from '$lib/utils/channels';


export type ProductFilterParams = QueryProductsArgs & {
  /** indicate that the product list section must reload */
  reload: boolean
};

const defaultState: ProductFilterParams = {
  channel: clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug),
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
};

const createProductFilterParamsStore = () => {
  const { subscribe, set } = writable<ProductFilterParams>(defaultState);

  return {
    subscribe,
    reset: () => set(defaultState),
    set,
  };
};

/** this store keeps track of products filter options  */
export const productFilterParamStore = createProductFilterParamsStore();
