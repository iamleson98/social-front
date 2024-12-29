import { checkoutStore } from './cart';
export type { CartItemProps } from './cart';

export { checkoutStore };

/**
 * @description keys for local storage items
 */
export type LocalStorageKey = 'cartItems' | 'toBeAddedLater';
