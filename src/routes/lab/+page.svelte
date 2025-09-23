<script lang="ts">
	// import { Button } from '$lib/components/ui';
	// import { randomString } from '$lib/utils/utils';
	// import Com from './com.svelte';

	const a = $state([1, 2, 3]);

	let b = $state(a);
</script>

{a}

{b}

<button onclick={() => (b = b.concat(2))}>update</button>
