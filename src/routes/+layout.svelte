<script lang="ts">
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import type { LayoutData } from './$types';
	import { userStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { INIT_LOCAL_STORAGE_LISTENERS } from '$lib/stores/app';
	import '../app.css';

	export let data: LayoutData;

	// add event listener for local storage
	onMount(() => {
		return INIT_LOCAL_STORAGE_LISTENERS();
	});

	$: userStore.set(data.user);
</script>

<Header />

<main class="pt-16 w-full h-full bg-gray-50 min-h-dvh">
	<slot />
</main>

<footer></footer>

<Toast />
