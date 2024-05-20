<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import type { LayoutData } from './$types';
	import { userStore } from '$lib/stores/auth';
	import type { User } from '$lib/gql/graphql';
	import { onMount } from 'svelte';
	import { INIT_LOCAL_STORAGE_LISTENERS } from '$lib/stores/app';

	export let data: LayoutData;

	// add event listener for local storage
	onMount(() => {
		const freeStorageListener = INIT_LOCAL_STORAGE_LISTENERS();

		// free memory
		return freeStorageListener;
	});

	$: {
		if (data.user) {
			userStore.set(data.user as User);
		}
	}
</script>

<Header />

<main class="mt-12 w-screen h-screen">
	<slot />
</main>

<footer></footer>

<Toast />
