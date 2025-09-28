<script lang="ts" module>
	/** every pages can use this store to access query params state. Updated every time search bar change */
	export const QyeryParamsStore = (() => {
		const innerStore = writable<SearchParamsType>({});

		return {
			subscribe: innerStore.subscribe,
			update: (params: SearchParamsType) => innerStore.set(params),
		};
	})();
</script>

<script lang="ts">
	// import { afterNavigate } from '$app/navigation';
	// import { page } from '$app/state';
	import { type SearchParamsType } from '$lib/utils/utils';
	import { writable } from 'svelte/store';

	// let lastUrlSearch = $state('');

	// afterNavigate(async () => {
	// 	if (page.url.search !== lastUrlSearch) {
	// 		QyeryParamsStore.update(parseUrlSearchParams(page.url));
	// 		lastUrlSearch = page.url.search;
	// 	}
	// });
</script>
