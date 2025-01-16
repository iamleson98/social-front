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

export const checkoutStore = writable<Checkout | null>(null);
