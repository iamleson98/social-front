<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { OutputData } from '@editorjs/editorjs';
	import { Input } from '$lib/components/ui/Input';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { any, array, number, object, string, z } from 'zod';
	import { tranFunc } from '$i18n';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import type { QueryTaxClassesArgs } from '$lib/gql/graphql';
	import { Button } from '$lib/components/ui/Button';
	import { page } from '$app/state';
	import { AppRoute } from '$lib/utils';
	import { ChevronLeft } from '$lib/components/icons';

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

	const RequiredErr = $tranFunc('helpText.fieldRequired');
	const NegativeErr = $tranFunc('error.negativeNumber');

	const MethodSchema = object({
		name: string().nonempty(RequiredErr),
		description: object({
			blocks: array(any()).nonempty(RequiredErr),
		}),
		maximumDeliveryDays: number().nonnegative(NegativeErr),
		minimumDeliveryDays: number().nonnegative(NegativeErr),
	}).refine((data) => data.maximumDeliveryDays >= data.minimumDeliveryDays, {
		message: 'max delivery days <= min delivery days',
		path: ['maximumDeliveryDays'],
	});

	type MethodType = z.infer<typeof MethodSchema>;

	let methodErrors = $state<Partial<Record<keyof MethodType, string[]>>>({});

	const validate = () => {
		const result = MethodSchema.safeParse({
			name,
			description,
			maximumDeliveryDays,
			minimumDeliveryDays,
		});
		methodErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	$effect(() => {
		ok = !Object.keys(methodErrors).length;
	});
</script>

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
		variant={methodErrors.name?.length ? 'error' : 'info'}
		subText={methodErrors.name?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
	<EditorJSComponent
		bind:value={description}
		required
		label="Description"
		{disabled}
		placeholder="Description"
		variant={methodErrors.description?.length ? 'error' : 'info'}
		subText={methodErrors.description?.[0]}
		onchange={validate}
	/>

	<div class="flex gap-2">
		<Input
			label="Minimum delivery days"
			bind:value={minimumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
			variant={methodErrors.minimumDeliveryDays?.length ? 'error' : 'info'}
			subText={methodErrors.minimumDeliveryDays?.[0]}
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
			min={0}
		/>
		<Input
			label="Maximum delivery days"
			bind:value={maximumDeliveryDays}
			required
			type="number"
			{disabled}
			class="flex-1/2"
			variant={methodErrors.maximumDeliveryDays?.length ? 'error' : 'info'}
			subText={methodErrors.maximumDeliveryDays?.[0]}
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
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
