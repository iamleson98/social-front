import { CART_ITEMS_STORE } from './cart';
export type { CartItemProps } from './cart';

export { CART_ITEMS_STORE };

/**
 * @description keys for local storage items
 */
export type LocalStorageKey = 'cartItems' | 'toBeAddedLater';

/**
 * @note This code is intended to be called on onMount event of main +layout.svelte file
 * @returns a function that removes the event listener
 */
export const INIT_LOCAL_STORAGE_LISTENERS = () => {
  if (typeof window === 'undefined') {
    console.error('INIT_LOCAL_STORAGE_LISTENERS should only be called in the browser');
    return;
  };

  const localStorageChangeListener = (evt: StorageEvent) => {
    switch (evt.key as LocalStorageKey) {
      case 'cartItems':
        CART_ITEMS_STORE.set(JSON.parse(evt.newValue || '[]'));
        break;
    }
  };

  addEventListener('storage', localStorageChangeListener);

  return () => {
    removeEventListener('storage', localStorageChangeListener);
  };
};


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
