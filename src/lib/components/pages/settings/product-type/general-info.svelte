<script lang="ts">
	import { tranFunc } from '$i18n';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { Checkbox, Input, Label, RadioButton } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { ProductTypeKindEnum, type QueryTaxClassesArgs } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { ValidSlugRegex } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import slugify from 'slugify';
	import { boolean, object, string } from 'zod';

	type Props = {
		name: string;
		slug: string;
		disabled?: boolean;
		kind: ProductTypeKindEnum;
		isShippingRequired: boolean;
		taxClass?: string;
		formOk: boolean;
		isCreatePage?: boolean;
	};

	let {
		name = $bindable(),
		disabled,
		kind = $bindable(),
		isShippingRequired = $bindable(),
		taxClass = $bindable(),
		formOk = $bindable(),
		slug = $bindable(),
		isCreatePage,
	}: Props = $props();

	const ProductTypeSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		slug: string()
			.nonempty($CommonState.FieldRequiredError)
			.regex(ValidSlugRegex, 'Please provide valid slug'),
		kind: string().nonempty($CommonState.FieldRequiredError),
		isShippingRequired: boolean(),
	});

	const SchemaHandler = createSchemaHandler(ProductTypeSchema, () => ({
		name,
		slug,
		kind,
		isShippingRequired,
	}));

	$effect(() => {
		formOk = !Object.keys($SchemaHandler).length;
	});

	const handleNameChange = () => {
		if (isCreatePage) slug = slugify(name, { trim: true, strict: true, lower: true });
		SchemaHandler.validate();
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General information</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<Input
			label="Name"
			placeholder="Name"
			required
			bind:value={name}
			{disabled}
			onblur={handleNameChange}
			inputDebounceOption={{ onInput: handleNameChange }}
			variant={$SchemaHandler.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler.name?.[0]}
		/>
		<Input
			label="Slug"
			placeholder="Slug"
			required
			bind:value={slug}
			{disabled}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.slug?.length ? 'error' : 'info'}
			subText={$SchemaHandler.slug?.[0]}
		/>
	</div>

	<div class="space-y-1">
		<Label
			label="Product type"
			required
			requiredAtPos="end"
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			label="Normal product type"
			value={ProductTypeKindEnum.Normal}
			bind:group={kind}
			{disabled}
			onchange={SchemaHandler.validate}
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			value={ProductTypeKindEnum.GiftCard}
			bind:group={kind}
			subText="This product will act as payment method"
			{disabled}
			onchange={SchemaHandler.validate}
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		>
			{#snippet label()}
				<div class="flex items-center gap-1">
					<span>Gift card product type</span>
					<Badge size="xs" text={$tranFunc('settings.preview')} variant="outline" rounded />
				</div>
			{/snippet}
		</RadioButton>
	</div>

	<div class="flex gap-2 items-center">
		<Checkbox label="require shipping" bind:checked={isShippingRequired} class="w-1/3" {disabled} />

		<GraphqlPaginableSelect
			class="w-2/3"
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
</div>
