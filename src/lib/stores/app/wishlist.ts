import { browser } from '$app/environment';
import { writable, type Readable } from 'svelte/store';

const STORAGE_KEY = 'sitename_wishlist';

const readStoredIds = (): string[] => {
	if (!browser) {
		return [];
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
};

const persist = (ids: string[]): void => {
	if (!browser) {
		return;
	}

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// storage full / unavailable: the in-memory state still works
	}
};

interface WishlistStore extends Readable<string[]> {
	/** replace the whole wishlist content */
	set: (ids: string[]) => void;
	/** add or remove a product from the wishlist. returns `true` when the product was added */
	toggle: (productId: string) => boolean;
	remove: (productId: string) => void;
	clear: () => void;
}

const createWishlistStore = (): WishlistStore => {
	const { subscribe, set, update } = writable<string[]>(readStoredIds());

	// keep localStorage in sync (browser only)
	if (browser) {
		let initialized = false;
		subscribe((ids) => {
			// skip the initial emission to avoid re-writing what we just read
			if (!initialized) {
				initialized = true;
				return;
			}
			persist(ids);
		});
	}

	return {
		subscribe,
		set,
		/** add or remove a product from the wishlist. returns `true` when the product was added */
		toggle: (productId: string): boolean => {
			let added = false;
			update((ids) => {
				if (ids.includes(productId)) {
					added = false;
					return ids.filter((id) => id !== productId);
				}
				added = true;
				return [...ids, productId];
			});
			return added;
		},
		remove: (productId: string): void => {
			update((ids) => ids.filter((id) => id !== productId));
		},
		clear: (): void => set([]),
	};
};

/** product ids saved by the current visitor (persisted in localStorage) */
export const wishlistStore = createWishlistStore();
