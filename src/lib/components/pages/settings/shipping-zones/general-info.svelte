<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea, Toggle } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { ShopStoreManager } from '$lib/stores/shop';
	import { CommonState } from '$lib/utils/common.svelte';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { object, string } from 'zod';

	type Props = {
		name: string;
		description: string;
		disabled?: boolean;
		countries: string[];
		isDefault: boolean;
		formOk: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		countries = $bindable(),
		isDefault = $bindable(),
		formOk = $bindable(),
	}: Props = $props();

	const ZoneSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		description: string().nonempty($CommonState.FieldRequiredError),
	});
	const SchemaHandler = createSchemaHandler(
		ZoneSchema,
		() => ({
			name,
			description,
		}),
		(ok) => (formOk = ok),
	);
</script>

{void formOk}

<div class="bg-white border border-gray-200 p-3 space-y-2 rounded-lg">
	<SectionHeader>
		<dir>General information</dir>
	</SectionHeader>

	<Input
		required
		label="Name"
		placeholder="Name"
		bind:value={name}
		{disabled}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
	/>
	<TextArea
		required
		label="Description"
		placeholder="Description"
		bind:value={description}
		inputClass="min-h-20"
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0]}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		{disabled}
	/>
	<Toggle label="Is default" bind:checked={isDefault} {disabled} />

	<SectionHeader>
		<div>Countries ({countries.length})</div>
	</SectionHeader>

	<Select
		label="Countries"
		placeholder="Shipping zone countries"
		multiple
		required
		bind:value={countries}
		options={$ShopStoreManager?.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		})) || []}
		{disabled}
	/>
</div>
