<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Trash } from '$lib/components/icons';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import type { MetadataInput } from '$lib/gql/graphql';
	import { tranFunc } from '$i18n';
	import { object, string, z } from 'zod';
	import { difference } from 'es-toolkit';

	type Props = {
		title: string;
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

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const dataSchema = object({
		key: string().nonempty(REQUIRED_ERROR),
		value: string().nonempty(REQUIRED_ERROR),
	});

	/** to keep track of old data */
	const oldMetadata = data.reduce(
		(acc, cur) => ({ ...acc, [cur.key]: true }),
		{} as Record<string, boolean>,
	);
	let activeMetadata = $state(data);

	type DataSchema = z.infer<typeof dataSchema>;

	let dataFormErrors = $state<Partial<Record<keyof DataSchema, string[]>>[]>([]);

	const calculateResult = () => {
		const itemsToAdd: MetadataInput[] = [];

		for (const item of activeMetadata) {
			if (!oldMetadata[item.key]) itemsToAdd.push(item);
		}

		metadataItemsToAdd = itemsToAdd;
		metadataKeysToRemove = difference(
			Object.keys(oldMetadata),
			activeMetadata.map((item) => item.key),
		);
	};

	const validate = (index: number) => {
		const item = activeMetadata[index];

		const result = dataSchema.safeParse(item);

		if (result.success) {
			// check for duplicate
			for (let i = 0; i < activeMetadata.length && i !== index; i++) {
				if (item.key === activeMetadata[i].key) {
					dataFormErrors[index] = { key: [`duplicate key ${item.key}`] };
					return;
				}
			}
			dataFormErrors[index] = {};
			calculateResult();
			return;
		}

		dataFormErrors[index] = result.error?.formErrors.fieldErrors;
	};

	const handleAddRecord = () => {
		activeMetadata = activeMetadata.concat({ key: '', value: '' });
		dataFormErrors = dataFormErrors.concat({});
	};

	const handleRemoveData = (idx: number) => {
		dataFormErrors = dataFormErrors.filter((_, i) => i !== idx);
		activeMetadata = activeMetadata.filter((_, i) => i !== idx);
		calculateResult();
	};
</script>

<Accordion header={`${title} (${data.length})`} class={className}>
	{#each activeMetadata as item, idx (idx)}
		<div class="flex gap-2 items-start mb-3">
			<div class="flex items-start gap-2 flex-4/5">
				<Input
					placeholder="Key"
					size="sm"
					bind:value={item.key}
					{disabled}
					required
					class="flex-1"
					onblur={() => validate(idx)}
					inputDebounceOption={{ onInput: () => validate(idx) }}
					variant={dataFormErrors[idx]?.key?.length ? 'error' : 'info'}
					subText={dataFormErrors[idx]?.key?.[0]}
				/>

				<Input
					placeholder="Value"
					size="sm"
					bind:value={item.value}
					{disabled}
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
				onclick={() => handleRemoveData(idx)}
				{disabled}
			>
				{$tranFunc('btn.delete')}
			</Button>
		</div>
	{/each}

	<Button variant="outline" size="xs" onclick={handleAddRecord} {disabled}>
		{$tranFunc('btn.add')}
	</Button>
</Accordion>
