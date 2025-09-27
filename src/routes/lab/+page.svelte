<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	// import { Button } from '$lib/components/ui';
	// import { randomString } from '$lib/utils/utils';
	// import Com from './com.svelte';

	// const a = $state([1, 2, 3]);

	let b = $state('');
</script>

<button onclick={async () => {
	const rand = Math.random().toString();
	b = rand;
	page.url.searchParams.set('number', rand);
	await goto(`${page.url.pathname}?${page.url.searchParams.toString()}`)
}}>change</button>

<div>{b}</div>
