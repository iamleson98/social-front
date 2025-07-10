<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { ButtonSkeleton } from '$lib/components/ui/Button';
	import GeneralSelect from '$lib/components/ui/select/general-select.svelte';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import type { OutputData } from '@editorjs/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import { type MediaObject } from '$lib/utils/types';
	import RuleEdit from '$lib/components/pages/settings/config/promotions/rule-edit.svelte';
	import { Modal } from '$lib/components/ui/Modal';

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

	let value = $state<string[]>([]);
	// let prds = $state();
	// let currency = $state<string>();

	let editorValue = $state<OutputData>();
	let medias = $state<MediaObject[]>([]);
</script>

<div>lab</div>

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

<ButtonSkeleton size="xl" />

<GeneralSelect
	size="sm"
	label="GeneralSelect"
	variant="error"
	multiple={true}
	subText="subText"
	disabled={false}
	onchange={console.log}
	maxDisplay={1}
	bind:value
	options={[
		{ label: 'Option 1', value: '1' },
		{ label: 'Option 2', value: '2' },
		{ label: 'Option 3', value: '3' },
	]}
/>

<EditorJSComponent
	placeholder="Enter description"
	onchange={console.log}
	label="lol"
	variant="error"
	subText="hello world"
	bind:value={editorValue}
/>

<FileInputContainer accept="*" max={5} bind:medias required label="EditorJS" />

<!-- <Modal header="edit rule" open>
	<RuleEdit />
</Modal> -->

