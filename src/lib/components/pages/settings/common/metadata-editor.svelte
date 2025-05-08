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
	};

	let { title = $bindable(), data = $bindable(), disabled }: Props = $props();

	let dataFormErrors = $state.raw<Partial<Record<keyof DataSchema, string[]>>>({});

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const dataSchema = object({
		key: string().nonempty(REQUIRED_ERROR),
		value: string().nonempty(REQUIRED_ERROR)
	});

	type DataSchema = z.infer<typeof dataSchema>;

	const validate = (data: MetadataInput) => {
		const result = dataSchema.safeParse({
			key: data.key,
			value: data.value
		});

		if (!result.success) {
			dataFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}

		dataFormErrors = {};
		return true;
	};

	const addData = () => {
		data = data.concat({ key: '', value: '' });
	};

	const removeData = (idx: number) => {
		data = data.filter((_, i) => i !== idx);
	};
</script>

<Accordion header={title} open={false}>
	{#each data as item, idx (idx)}
		<div class="flex gap-5 items-center mb-3">
			<Input
				placeholder="Key"
				bind:value={item.key}
				{disabled}
				required
				class="flex-1"
				onblur={() => validate(item)}
				variant={dataFormErrors?.key?.length ? 'error' : 'info'}
				subText={dataFormErrors?.key?.length ? dataFormErrors.key[0] : undefined}
			/>
			<Input
				placeholder="Value"
				bind:value={item.value}
				{disabled}
				required
				class="flex-1"
				onblur={() => validate(item)}
				variant={dataFormErrors?.value?.length ? 'error' : 'info'}
				subText={dataFormErrors?.value?.length ? dataFormErrors.value[0] : ''}
			/>
			<IconButton
				icon={Trash}
				size="xs"
				color="red"
				variant="light"
				onclick={() => removeData(idx)}
			/>
		</div>
	{/each}

	<Button variant="outline" size="xs" onclick={() => addData()}>Add</Button>
</Accordion>
