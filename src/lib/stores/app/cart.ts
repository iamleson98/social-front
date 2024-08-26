import { persisted } from 'svelte-persisted-store';

export type CartItemProps = {
  productName: string;
  quantity: number;
  productSlug: string;
  variantId?: string;
  previewImage: string;
  previewImageAlt?: string | null;
};

/** this util function helps organize cart items before persisting to local storage  */
export const reorganizeCartItems = (items: CartItemProps[]) => {
  // const productQuantityMap: Record<string, number> = {};
  // const variantQuantityMap: Record<string, number> = {};

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

  return [...Object.values(variantItemsMap), ...Object.values(productItemsMap)];

  // for (const item of items) {
  //   if (item.productName && item.variantId) {
  //     if (variantQuantityMap[item.variantId] === undefined) {
  //       variantQuantityMap[item.variantId] = item.quantity;
  //     } else {
  //       variantQuantityMap[item.variantId] += item.quantity;
  //     }
  //     continue;
  //   }

  //   if (item.productName) {
  //     if (productQuantityMap[item.productName] === undefined) {
  //       productQuantityMap[item.productName] = item.quantity;
  //     } else {
  //       productQuantityMap[item.productName] += item.quantity;
  //     }
  //   }
  // }

  // const result: CartItemProps[] = [];
  // const variantMeetMap: Record<string, boolean> = {};
  // const productMeetMap: Record<string, boolean> = {};

  // for (const item of items) {
  //   if (item.productName && item.variantId) {
  //     if (variantMeetMap[item.variantId] !== undefined) continue;

  //     result.push({
  //       ...item,
  //       quantity: variantQuantityMap[item.variantId],
  //     });
  //     variantMeetMap[item.variantId] = true;
  //     continue;
  //   }

  //   if (item.productName) {
  //     if (productMeetMap[item.productName] !== undefined) continue;

  //     result.push({
  //       ...item,
  //       quantity: productQuantityMap[item.productName],
  //     });
  //     productMeetMap[item.productName] = true;
  //   }
  // }

  // return result;
};

/**
 * @NOTE before writing/update to cartItemStore, make sure to call `{@ref reorganizeCartItems}`
 */
export const cartItemStore = persisted<CartItemProps[]>(
  'cartItems',
  [],
  { storage: 'local' }
);
