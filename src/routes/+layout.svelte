<script lang="ts">
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import type { LayoutData } from './$types';
	import { userStore } from '$lib/stores/auth';
	import type { User } from '$lib/gql/graphql';
	import { onMount } from 'svelte';
	import { INIT_LOCAL_STORAGE_LISTENERS } from '$lib/stores/app';
	import '../app.css';

	export let data: LayoutData;

	// add event listener for local storage
	onMount(() => {
		const freeStorageListener = INIT_LOCAL_STORAGE_LISTENERS();

		// free memory
		return freeStorageListener;
	});

	$: userStore.set(data.user as User);
</script>

<Header />

<main class="pt-16 w-full h-full bg-gray-50">
	<slot />
</main>

<footer></footer>

<Toast />
