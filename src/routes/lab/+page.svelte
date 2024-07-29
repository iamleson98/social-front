<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Rating from '$lib/components/pages/products/rating.svelte';

	let showWarning = false;

	onMount(() => {
		let timeOut: NodeJS.Timeout;

		if (!dev) {
			showWarning = true;
			timeOut = setTimeout(() => {
				goto('/');
			}, 3000);
		}

		return () => {
			clearTimeout(timeOut);
		};
	});
</script>

<h1>
	This page is for experimental purposes only. You should import your components or idea here to
	test it.
</h1>

{#if showWarning}
	<p class="text-orange-600 font-bold text-lg p-3 rounded bg-orange-100">
		You will be redirected to the home page in 3 seconds.
	</p>
{/if}

<div>
	<Rating rating={3.6} />
</div>
