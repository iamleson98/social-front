<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ChevronLeft } from '$lib/components/icons';
	import { Button } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type { QueryTaxClassesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import { any, array, number, object, string } from 'zod';

	type Props = {
		name: string;
		description: OutputData;
		disabled?: boolean;
		maximumDeliveryDays: number;
		minimumDeliveryDays: number;
		taxClass?: string;
		ok: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		maximumDeliveryDays = $bindable(),
		minimumDeliveryDays = $bindable(),
		taxClass = $bindable(),
		ok = $bindable(),
	}: Props = $props();

	const MethodSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).nonempty($CommonState.FieldRequiredError),
		}),
		maximumDeliveryDays: number().nonnegative($CommonState.NonNegativeError),
		minimumDeliveryDays: number().nonnegative($CommonState.NonNegativeError),
	}).refine((data) => data.maximumDeliveryDays >= data.minimumDeliveryDays, {
		message: 'max delivery days <= min delivery days',
		path: ['maximumDeliveryDays'],
	});
	const SchemaHandler = createSchemaHandler(
		MethodSchema,
		() => ({
			name,
			description,
			maximumDeliveryDays,
			minimumDeliveryDays,
		}),
		(success) => (ok = success),
	);
</script>

{void ok}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div class="flex gap-1">
			<Button
				href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id!)}
				startIcon={ChevronLeft}
				size="xs"
				variant="light"
				color="gray"
			>
				Back
			</Button>
			<span>General information</span>
		</div>
	</SectionHeader>
	<Input
		label="Name"
		bind:value={name}
		required
		placeholder="Name"
		{disabled}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
	/>
	<EditorJSComponent
		bind:value={description}
		required
		label="Description"
		{disabled}
		placeholder="Description"
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0]}
		onchange={SchemaHandler.validate}
	/>

	<div class="flex gap-2">
		<Input
			label="Minimum delivery days"
			bind:value={minimumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
			variant={$SchemaHandler.minimumDeliveryDays?.length ? 'error' : 'info'}
			subText={$SchemaHandler.minimumDeliveryDays?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			min={0}
		/>
		<Input
			label="Maximum delivery days"
			bind:value={maximumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
			variant={$SchemaHandler.maximumDeliveryDays?.length ? 'error' : 'info'}
			subText={$SchemaHandler.maximumDeliveryDays?.[0]}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			min={0}
		/>
	</div>

	<GraphqlPaginableSelect
		query={TAX_CLASSES_QUERY}
		resultKey="taxClasses"
		variables={{ first: 20 } as QueryTaxClassesArgs}
		optionValueKey="id"
		optionLabelKey="name"
		{disabled}
		label={$tranFunc('product.taxCls')}
		bind:value={taxClass}
	/>
</div>
