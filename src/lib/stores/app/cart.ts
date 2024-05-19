import { readable } from 'svelte/store';

export type CartItemProps = {
  productName: string;
  quantity: number;
  productSlug: string;
  previewImage?: string;
  previewImageAlt: string;
};

/**
 * @description keys for local storage items
 */
export type LocalStorageKey = 'cartItems' | 'other';


/**
 * @description Store for the items put in the cart
 * @note NEVER use this store in server code
 */
export const CART_ITEMS_STORE = readable<CartItemProps[]>([], (set) => {
  const localStorageChangeListener = (evt: StorageEvent) => {
    switch (evt.key as LocalStorageKey) {
      case 'cartItems':
        set(JSON.parse(evt.newValue || '[]'));
        break;
    }
  }
  addEventListener('storage', localStorageChangeListener);

  return () => {
    removeEventListener('storage', localStorageChangeListener);
  };
});

/**
 * @note NEVER use this function in server code
 * @param value - if `null`, the item will be removed from localStorage
 */
export const LOCAL_STORAGE_SETTER = (key: LocalStorageKey, value: unknown | null) => {
  if (value === null) {
    localStorage.removeItem(key);
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting ${key} in localStorage: ${err}`);
  }
};
