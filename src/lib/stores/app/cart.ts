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
  const productQuantityMap: Record<string, number> = {};
  const variantQuantityMap: Record<string, number> = {};

  for (const item of items) {
    if (item.productName && item.variantId) {
      if (variantQuantityMap[item.variantId] === undefined) {
        variantQuantityMap[item.variantId] = item.quantity;
      } else {
        variantQuantityMap[item.variantId] += item.quantity;
      }
      continue;
    }

    if (item.productName) {
      if (productQuantityMap[item.productName] === undefined) {
        productQuantityMap[item.productName] = item.quantity;
      } else {
        productQuantityMap[item.productName] += item.quantity;
      }
    }
  }

  const result: CartItemProps[] = [];
  const variantMeetMap: Record<string, boolean> = {};
  const productMeetMap: Record<string, boolean> = {};

  for (const item of items) {
    if (item.productName && item.variantId) {
      if (variantMeetMap[item.variantId] !== undefined) continue;

      result.push({
        quantity: variantQuantityMap[item.variantId],
        productName: item.productName,
        variantId: item.variantId,
        previewImage: item.previewImage,
        previewImageAlt: item.previewImageAlt,
        productSlug: item.productSlug,
      });
      variantMeetMap[item.variantId] = true;
      continue;
    }

    if (item.productName) {
      if (productMeetMap[item.productName] !== undefined) continue;

      result.push({
        quantity: productQuantityMap[item.productName],
        productName: item.productName,
        previewImage: item.previewImage,
        previewImageAlt: item.previewImageAlt,
        productSlug: item.productSlug,
      });
      productMeetMap[item.productName] = true;
    }
  }

  return result;
};

/**
 * @NOTE before writing/update to cartItemStore, make sure to call `{@ref reorganizeCartItems}`
 */
export const cartItemStore = persisted<CartItemProps[]>(
  'cartItems',
  [],
  { storage: 'local' }
);
