<script lang="ts">
	import { tranFunc } from '$i18n';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { Checkbox, Input, Label, RadioButton } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { ProductTypeKindEnum, type QueryTaxClassesArgs } from '$lib/gql/graphql';
	import { ValidSlugRegex } from '$lib/utils/consts';
	import slugify from 'slugify';
	import z, { boolean, object, string } from 'zod';

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

	const RequiredErr = $tranFunc('helpText.fieldRequired');
	const ProductTypeSchema = object({
		name: string().nonempty(RequiredErr),
		slug: string().nonempty(RequiredErr).regex(ValidSlugRegex, 'Please provide valid slug'),
		kind: string().nonempty(RequiredErr),
		isShippingRequired: boolean(),
	});

	type ProductTypeType = z.infer<typeof ProductTypeSchema>;

	let productTypeFormErrors = $state.raw<Partial<Record<keyof ProductTypeType, string[]>>>({});

	const validate = () => {
		const result = ProductTypeSchema.safeParse({ name, slug, kind, isShippingRequired });
		productTypeFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	$effect(() => {
		formOk = !Object.keys(productTypeFormErrors).length;
	});

	const handleNameChange = () => {
		if (isCreatePage) slug = slugify(name, { trim: true, strict: true, lower: true });
		validate();
	};
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-3">
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
			variant={productTypeFormErrors.name?.length ? 'error' : 'info'}
			subText={productTypeFormErrors.name?.[0]}
		/>
		<Input
			label="Slug"
			placeholder="Slug"
			required
			bind:value={slug}
			{disabled}
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
			variant={productTypeFormErrors.slug?.length ? 'error' : 'info'}
			subText={productTypeFormErrors.slug?.[0]}
		/>
	</div>

	<div class="space-y-1">
		<Label
			label="Product type"
			required
			requiredAtPos="end"
			variant={productTypeFormErrors.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			label="Normal product type"
			value={ProductTypeKindEnum.Normal}
			bind:group={kind}
			{disabled}
			onchange={validate}
			variant={productTypeFormErrors.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			value={ProductTypeKindEnum.GiftCard}
			bind:group={kind}
			subText="This product will act as payment method"
			{disabled}
			onchange={validate}
			variant={productTypeFormErrors.kind?.length ? 'error' : 'info'}
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
