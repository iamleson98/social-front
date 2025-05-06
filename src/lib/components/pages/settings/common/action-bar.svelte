<script lang="ts">
	import { Button } from '$lib/components/ui';

	type Props = {
		disabled?: boolean;
		/** if provided, a red delete button will appear to the left. clicking it will call this callback */
		onDeleteClick?: () => void;
		/** If your page need back functionality, please provide a valid URL  */
		backButtonUrl?: string;
		onUpdateClick?: () => void;
		class?: string;
		onAddClick?: () => void;
	};

	let {
		disabled = false,
		class: className = '',
		onDeleteClick,
		backButtonUrl,
		onUpdateClick,
		onAddClick
	}: Props = $props();
</script>

<div
	class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200 {className}"
>
	<div>
		{#if onDeleteClick}
			<Button color="red" {disabled} onclick={onDeleteClick}>Delete</Button>
		{/if}
	</div>
	<div class="flex gap-2">
		{#if backButtonUrl}
			<Button variant="light" color="gray" {disabled} href={backButtonUrl}>Back</Button>
		{/if}
		{#if onUpdateClick}
			<Button {disabled} onclick={onUpdateClick}>Update</Button>
		{:else if onAddClick}
			<Button {disabled} onclick={onAddClick}>Create</Button>
		{/if}
	</div>
</div>
