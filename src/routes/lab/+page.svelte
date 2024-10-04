<script lang="ts">
	let count = $state(1);

	$effect(() => {
		if ($effect.tracking()) console.log('count changed', count);
	});
</script>

<div>{count}</div>

<button onclick={() => count++}>click</button>
