import type { Checkout, Money } from '$lib/gql/graphql';
import { writable } from 'svelte/store';

export type CartItemProps = {
  productName: string;
  quantity: number;
  productSlug: string;
  variantId?: string;
  previewImage: string;
  previewImageAlt?: string | null;
  quantityAvailable?: number | null;
  grossPrice?: Money,
};

/** this util function helps organize cart items before persisting to local storage  */
export const reorganizeCartItems = (items: CartItemProps[]) => {
  const variantItemsMap: Record<string, CartItemProps> = {}; // keys are variant ids
  const productItemsMap: Record<string, CartItemProps> = {}; // keys are product ids

  for (const item of items) {
    if (item.productName && item.variantId) {
      if (variantItemsMap[item.variantId] === undefined) {
        variantItemsMap[item.variantId] = item;
      } else {
        variantItemsMap[item.variantId].quantity += item.quantity;
      }

      continue;
    }

    if (item.productName) {
      if (productItemsMap[item.productName] === undefined) {
        productItemsMap[item.productName] = item;
      } else {
        productItemsMap[item.productName].quantity += item.quantity;
      }
    }
  }

  return Object
    .values(variantItemsMap)
    .concat(Object.values(productItemsMap));
};

/**
 * @NOTE before writing/update to checkoutStore, make sure to call `{@ref reorganizeCartItems}`
 */
export const checkoutStore = writable<Checkout | null>(null);
