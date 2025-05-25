<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { IconButton } from '$lib/components/ui/Button';
	import { Trash } from '$lib/components/icons';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { Accordion } from '$lib/components/ui/Accordion';
	import type { MetadataInput } from '$lib/gql/graphql';
	import { tranFunc } from '$i18n';
	import { object, string, z } from 'zod';

	type Props = {
		title: string;
		data: MetadataInput[];
		disabled?: boolean;
		class?: string;
	};

	let { title, data = $bindable([]), disabled, class: className = '' }: Props = $props();

	let dataFormErrors = $state<Partial<Record<keyof DataSchema, string[]>>[]>([]);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const dataSchema = object({
		key: string().nonempty(REQUIRED_ERROR),
		value: string().nonempty(REQUIRED_ERROR),
	});

	type DataSchema = z.infer<typeof dataSchema>;

	const validate = (item: MetadataInput, index: number) => {
		const result = dataSchema.safeParse({
			key: item.key,
			value: item.value,
		});

		if (!result.success) {
			dataFormErrors[index] = result.error.formErrors.fieldErrors;
			return false;
		}

		dataFormErrors[index] = {};
		return true;
	};

	const handleAddRecord = () => {
		data = data.concat({ key: '', value: '' });
		dataFormErrors = dataFormErrors.concat({});
	};

	const handleRemoveData = (idx: number) => {
		data = data.filter((_, i) => i !== idx);
		dataFormErrors = dataFormErrors.filter((_, i) => i !== idx);
	};
</script>

<Accordion header={title} class={className}>
	{#each data as item, idx (idx)}
		<div class="flex gap-2 items-center mb-3">
			<div class="flex items-start gap-2 flex-4/5">
				<Input
					placeholder="Key"
					size="sm"
					bind:value={item.key}
					{disabled}
					required
					class="flex-1"
					onblur={() => validate(item, idx)}
					inputDebounceOption={{ onInput: () => validate(item, idx) }}
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
					onblur={() => validate(item, idx)}
					inputDebounceOption={{ onInput: () => validate(item, idx) }}
					variant={dataFormErrors[idx]?.value?.length ? 'error' : 'info'}
					subText={dataFormErrors[idx]?.value?.[0]}
				/>
			</div>

			<div class="flex-1/5 text-right">
				<Button
					startIcon={Trash}
					size="sm"
					fullWidth
					color="red"
					variant="light"
					onclick={() => handleRemoveData(idx)}
					{disabled}
				>
					Delete
				</Button>
			</div>
		</div>
	{/each}

	<Button variant="outline" size="xs" onclick={handleAddRecord} {disabled}>Add</Button>
</Accordion>
