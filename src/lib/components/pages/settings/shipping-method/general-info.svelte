<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { classNames, SitenameCommonClassName } from '$lib/utils/utils';
	import type { OutputData } from '@editorjs/editorjs';
	import { Input } from '$lib/components/ui/Input';
	import { EditorJSComponent } from '$lib/components/common/editorjs';

	type Props = {
		name: string;
		description: OutputData;
		disabled?: boolean;
		maximumDeliveryDays: number;
		minimumDeliveryDays: number;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		maximumDeliveryDays = $bindable(),
		minimumDeliveryDays = $bindable(),
	}: Props = $props();
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General information</SectionHeader>
	<Input label="Name" bind:value={name} required placeholder="Name" {disabled} />
	<EditorJSComponent
		bind:value={description}
		required
		label="Description"
		{disabled}
		placeholder="Description"
	/>

	<div class="flex gap-2">
		<Input
			label="Minimum delivery days"
			bind:value={minimumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
		/>
		<Input
			label="Maximum delivery days"
			bind:value={maximumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
		/>
	</div>
</div>
