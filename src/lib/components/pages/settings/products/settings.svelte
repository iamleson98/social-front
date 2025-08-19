<script lang="ts">
	import { SettingCog } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { Modal } from '$lib/components/ui/Modal';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';

	let openExportModal = $state(false);
</script>

<DropDown
	placement="bottom-end"
	options={[
		{
			children: 'Export products',
			onclick: () => (openExportModal = true),
		},
	]}
>
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<IconButton
			size="sm"
			icon={SettingCog}
			color="gray"
			{onclick}
			class="tooltip tooltip-left"
			data-tip="Settings"
		/>
	{/snippet}
</DropDown>

<Modal
	header="Export products"
	open={openExportModal}
	onCancel={() => (openExportModal = false)}
	onClose={() => (openExportModal = false)}
	closeOnEscape
	closeOnOutsideClick
>
	<div role="tablist" class="tabs tabs-border">
		<a role="tab" class="tab tab-active" href="#"> Information exported </a>
		<a role="tab" class="tab" href="#"> Export setting </a>
	</div>
</Modal>
