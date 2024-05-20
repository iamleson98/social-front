import { writable } from 'svelte/store';

export type CartItemProps = {
  productName: string;
  quantity: number;
  productSlug: string;
  previewImage?: string;
  previewImageAlt: string;
};

export const CART_ITEMS_STORE = writable<CartItemProps[]>([]);
