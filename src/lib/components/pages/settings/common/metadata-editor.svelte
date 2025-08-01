<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Trash } from '$lib/components/icons';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import type { MetadataInput } from '$lib/gql/graphql';
	import { tranFunc } from '$i18n';
	import { object, string, z } from 'zod';
	import { CommonState } from '$lib/utils/common.svelte';
	import { addNoDup } from '$lib/utils/utils';

	type Props = {
		title: string;
		/** the existing metadata pairs */
		data: MetadataInput[];
		disabled?: boolean;
		class?: string;
		valueChanged?: boolean;
		metadataItemsToAdd?: MetadataInput[];
		metadataKeysToRemove?: string[];
	};

	let {
		title,
		data,
		disabled,
		class: className = '',
		valueChanged = $bindable(false),
		metadataItemsToAdd = $bindable([]),
		metadataKeysToRemove = $bindable([]),
	}: Props = $props();

	const DataSchema = object({
		key: string().nonempty(CommonState.FieldRequiredError),
		value: string().nonempty(CommonState.FieldRequiredError),
	});
	type DataSchemaType = z.infer<typeof DataSchema>;

	/** keeps track of existing meta data keys */
	const ExistingMetadataKeys = data.map((item) => item.key);
	let activeMetadata = $state(data);
	let dataFormErrors = $state<Partial<Record<keyof DataSchemaType, string[]>>[]>([]);

	const calculateResult = () => {
		metadataItemsToAdd = activeMetadata.filter((item) => !ExistingMetadataKeys.includes(item.key));
	};

	const validate = (index: number) => {
		const item = activeMetadata[index];

		const result = DataSchema.safeParse(item);

		if (result.success) {
			// check for duplicate
			for (let i = 0; i < activeMetadata.length && i !== index; i++) {
				if (item.key === activeMetadata[i].key) {
					dataFormErrors[index] = { key: [$tranFunc('common.duplicate', { val: item.key })] };
					return;
				}
			}
			dataFormErrors[index] = {};
			calculateResult();
			return;
		}

		dataFormErrors[index] = result.error?.formErrors.fieldErrors;
	};

	const handleAddPair = () => {
		activeMetadata = activeMetadata.concat({ key: '', value: '' });
		dataFormErrors = dataFormErrors.concat({});
	};

	const handleRemoveAPair = (idx: number) => {
		dataFormErrors = dataFormErrors.filter((_, i) => i !== idx);

		const itemToRemove = activeMetadata[idx];
		if (ExistingMetadataKeys.includes(itemToRemove.key)) {
			delete ExistingMetadataKeys[idx];
			metadataKeysToRemove = addNoDup(metadataKeysToRemove, itemToRemove.key);
		}

		activeMetadata = activeMetadata.filter((_, i) => i !== idx);
		calculateResult();
	};
</script>

<Accordion header={`${title} (${data.length})`} class={className}>
	{#each activeMetadata as item, idx (idx)}
		<!-- existing metadata should be read-only -->
		{@const readonly = ExistingMetadataKeys.includes(item.key)}
		<div class="flex gap-2 items-start mb-3">
			<div class="flex items-start gap-2 flex-4/5">
				<Input
					placeholder={$tranFunc('common.key')}
					size="sm"
					bind:value={item.key}
					{disabled}
					required
					{readonly}
					class="flex-1"
					onblur={() => validate(idx)}
					inputDebounceOption={{ onInput: () => validate(idx) }}
					variant={dataFormErrors[idx]?.key?.length ? 'error' : 'info'}
					subText={dataFormErrors[idx]?.key?.[0]}
				/>

				<Input
					placeholder={$tranFunc('common.value')}
					size="sm"
					bind:value={item.value}
					{disabled}
					{readonly}
					required
					class="flex-1"
					onblur={() => validate(idx)}
					inputDebounceOption={{ onInput: () => validate(idx) }}
					variant={dataFormErrors[idx]?.value?.length ? 'error' : 'info'}
					subText={dataFormErrors[idx]?.value?.[0]}
				/>
			</div>

			<Button
				startIcon={Trash}
				size="sm"
				color="red"
				variant="light"
				onclick={() => handleRemoveAPair(idx)}
				{disabled}
			>
				{$tranFunc('btn.delete')}
			</Button>
		</div>
	{/each}

	<Button variant="outline" size="xs" onclick={handleAddPair} {disabled}>
		{$tranFunc('btn.add')}
	</Button>
</Accordion>
