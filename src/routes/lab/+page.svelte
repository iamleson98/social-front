<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';

	// import { Button } from '$lib/components/ui';
	// import { randomString } from '$lib/utils/utils';
	// import Com from './com.svelte';

	// const a = $state([1, 2, 3]);

	let num = $state(Math.random());

	$effect(() => {
		console.log(num)
	});
</script>


<button onclick={() => (num = Math.floor(Math.random() * 10))}>number</button>
