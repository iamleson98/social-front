<script lang="ts" module>
  /** every pages can use this store to access query params state */
	export const QyeryParamsStore = writable<Record<string, unknown>>({});
</script>

<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { parseUrlSearchParams } from '$lib/utils/utils';
	import { writable } from 'svelte/store';

	afterNavigate(() => QyeryParamsStore.set(parseUrlSearchParams(page.url)));
</script>
