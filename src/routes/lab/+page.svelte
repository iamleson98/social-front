<script lang="ts">
	import SlideShow from '$lib/components/pages/lab/slide-show.svelte';
	import { AlertModal, Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';

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

<button onclick={() => (open = true)}>open</button>

<AlertModal
	{open}
	onCancel={() => (open = false)}
	onOk={() => (open = false)}
	onClose={() => (open = false)}
>
	<div>This is the content</div>
</AlertModal>
