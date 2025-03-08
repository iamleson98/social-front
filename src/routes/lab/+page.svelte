<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		const result = fetch('/figma.wasm', {
			headers: {
				'Accept-Encoding': 'gzip, deflate, br, zstd'
			}
		})
			.then((res) => res.arrayBuffer())
			.then((buffer) => WebAssembly.compile(buffer))
			.then((module) => WebAssembly.instantiate(module))
			.catch(console.error)
			.then(() => console.log('done'));

		// console.log(instance);
	});
</script>

<div>lab</div>
