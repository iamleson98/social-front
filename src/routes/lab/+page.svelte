<script lang="ts">
	import { func } from './c.svelte';

	let v = $state(1);

	const f = func(() => v);
</script>

<button onclick={() => v++}>Add</button>
<p>{v}</p>

<button onclick={f}>Get value</button>
