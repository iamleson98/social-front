import { wishlistStore } from './wishlist';
import { get as storeGet } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';

describe('wishlistStore', () => {
	beforeEach(() => {
		wishlistStore.clear();
	});

	it('starts empty', () => {
		expect(storeGet(wishlistStore)).toEqual([]);
	});

	it('toggle adds a product id once and reports added=true', () => {
		const added = wishlistStore.toggle('product-1');

		expect(added).toBe(true);
		expect(storeGet(wishlistStore)).toEqual(['product-1']);
	});

	it('toggle removes an existing product and reports added=false', () => {
		wishlistStore.toggle('product-1');
		const added = wishlistStore.toggle('product-1');

		expect(added).toBe(false);
		expect(storeGet(wishlistStore)).toEqual([]);
	});

	it('preserves insertion order of multiple products', () => {
		wishlistStore.toggle('b');
		wishlistStore.toggle('a');
		wishlistStore.toggle('c');

		expect(storeGet(wishlistStore)).toEqual(['b', 'a', 'c']);
	});

	it('remove deletes only the given product', () => {
		wishlistStore.toggle('a');
		wishlistStore.toggle('b');
		wishlistStore.remove('a');

		expect(storeGet(wishlistStore)).toEqual(['b']);
	});

	it('clear empties the wishlist', () => {
		wishlistStore.toggle('a');
		wishlistStore.toggle('b');
		wishlistStore.clear();

		expect(storeGet(wishlistStore)).toEqual([]);
	});
});
