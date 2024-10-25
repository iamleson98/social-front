<script lang="ts">
	import { debounceClick } from '$lib/actions/input-debounce';
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
	import { Button } from '$lib/components/ui';
	import { AlertModal, Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { TimeLine } from '$lib/components/ui/timeline';

	const options: SelectOption[] = [
		{ value: '1', label: 'Option 1' },
		{ value: '2', label: 'Option 2' },
		{ value: '3', label: 'Option 3' },
		{ value: '4', label: 'Option 4' },
		{ value: '5', label: 'Option 5' }
	];

	let open = $state(false);
</script>

<SlideShow />

<h1>Lab page</h1>

<button onclick={() => (open = true)}>open</button>

<AlertModal
	{open}
	onCancel={() => (open = false)}
	onOk={() => (open = false)}
	onClose={() => (open = false)}
>
	<div>This is the content</div>
</AlertModal>

<button
	use:debounceClick={{
		onInput: console.log
	}}>click</button
>

<Button
	clickDebounceOptions={{
		onInput: console.log
	}}>Click</Button
>

<TimeLine
	items={[
		{ done: true, title: 'Step 1' },
		{ done: true, title: 'Step 2' },
		{ done: false, title: 'Step 3' },
		{ done: false, title: 'Step 4' }
	]}
	
/>
