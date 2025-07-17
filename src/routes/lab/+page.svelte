<script>
	import { untrack } from "svelte";

	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});

	untrack
</script>

<button onclick={() => cleanup()}>clean</button>
<button onclick={() => (count += 1)}>add</button>
