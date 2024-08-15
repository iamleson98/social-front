import { persisted } from 'svelte-persisted-store';

export type CartItemProps = {
  productName: string;
  quantity: number;
  productSlug: string;
  variantId?: string;
  previewImage?: string;
  previewImageAlt: string;
};

export const cartItemStore = persisted<CartItemProps[]>('cartItems', []);
