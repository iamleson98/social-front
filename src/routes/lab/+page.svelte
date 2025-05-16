<script lang="ts">
	import { MultiSelect, Select } from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { ButtonSkeleton } from '$lib/components/ui/Button';
	import SelectSkeleton from '$lib/components/ui/select/select-skeleton.svelte';
	// import { Input } from '$lib/components/ui/Input';

	// onMount(async () => {
	// 	const result = fetch('/figma.wasm', {
	// 		headers: {
	// 			'Accept-Encoding': 'gzip, deflate, br, zstd'
	// 		}
	// 	})
	// 		.then((res) => res.arrayBuffer())
	// 		.then((buffer) => WebAssembly.compile(buffer))
	// 		.then((module) => WebAssembly.instantiate(module))
	// 		.catch(console.error)
	// 		.then(() => console.log('done'));

	// 	// console.log(instance);
	// });

	// let value = $state('');

	let items = $state([
		{
			one: 1,
			two: 2,
		},
		{
			one: 3,
			two: 4,
		},
	]);

	const handleDrop = (state: DragDropState<{}>) => {
		console.log(state);
	};
</script>

<div>lab</div>

<MultiSelect
	options={[
		{ label: 'Option 1', value: '1' },
		{ label: 'Option 2', value: '2' },
		{ label: 'Option 3', value: '3' },
	]}
	variant="error"
/>

<table class="table">
	<thead>
		<tr>
			<th>one</th>
			<th>two</th>
		</tr>
	</thead>
	<tbody use:droppable={{ container: 'list', callbacks: { onDrop: handleDrop } }}>
		{#each items as item, idx (idx)}
			<tr use:draggable={{ container: 'list', dragData: item }}>
				<td>{item.one}</td>
				<td>{item.two}</td>
			</tr>
		{/each}
	</tbody>
</table>

<SkeletonContainer>
	<Skeleton class="w-2 h-8" />
</SkeletonContainer>

<ButtonSkeleton size="xl" />

<div class="flex flex-row items-start gap-2 w-[500px]">
	<SelectSkeleton size="xs" />
	<SelectSkeleton label size="xs" />
</div>
