<script lang="ts">
	import { Button } from '$lib/components/ui';
	import Com from './com.svelte';
	import { randomString } from '$lib/utils/utils';

	const a = $state([1, 2, 3]);

	let b = $state(a);
</script>

{a}

{b}

<button onclick={() => b = b.concat(2)}>update</button>
