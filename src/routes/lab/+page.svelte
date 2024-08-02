<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import Rating from '$lib/components/pages/products/rating.svelte';
	import { Select } from '$lib/components/ui/select';

	let showWarning = $state(false);

	$effect(() => {
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

<Select
	choices={[
		{ label: 'Option 1', value: 'option1' },
		{ label: 'Option 2', value: 'option2' },
		{ label: 'Option 3', value: 'option3' }
	]}
/>
