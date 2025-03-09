<script lang="ts">
	import { MultiSelect } from '$lib/components/ui/select';
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

<MultiSelect
	options={[
		{ label: 'Option 1', value: '1' },
		{ label: 'Option 2', value: '2' },
		{ label: 'Option 3', value: '3' }
	]}
	variant="error"
/>
