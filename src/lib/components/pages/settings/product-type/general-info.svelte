<script lang="ts">
	import { T } from '$i18n';
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
			.regex(ValidSlugRegex, $T('error.invalidSlug')),
		kind: string().nonempty($CommonState.FieldRequiredError),
		isShippingRequired: boolean(),
	});

	const SchemaHandler = createSchemaHandler(
		ProductTypeSchema,
		() => ({
			name,
			slug,
			kind,
			isShippingRequired,
		}),
		(ok) => (formOk = ok),
	);

	const handleNameChange = () => {
		if (isCreatePage) slug = slugify(name, { trim: true, strict: true, lower: true });
		SchemaHandler.validate();
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('common.generalInfo')}</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<Input
			label={$T('common.name')}
			required
			bind:value={name}
			{disabled}
			onblur={handleNameChange}
			inputDebounceOption={{ onInput: handleNameChange }}
			variant={$SchemaHandler.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler.name?.[0]}
		/>
		<Input
			label={$T('common.slug')}
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
			label={$T('product.prdType')}
			required
			requiredAtPos="end"
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			label={$T('prdType.normalPrdType')}
			value={ProductTypeKindEnum.Normal}
			bind:group={kind}
			{disabled}
			onchange={SchemaHandler.validate}
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		/>
		<RadioButton
			value={ProductTypeKindEnum.GiftCard}
			bind:group={kind}
			subText={$T('prdType.giftcardPrdTypeHint')}
			{disabled}
			onchange={SchemaHandler.validate}
			variant={$SchemaHandler.kind?.length ? 'error' : 'info'}
		>
			{#snippet label()}
				<div class="flex items-center gap-1">
					<span>{$T('prdType.giftcardPrdType')}</span>
					<Badge size="xs" text={$T('settings.preview')} variant="outline" rounded />
				</div>
			{/snippet}
		</RadioButton>
	</div>

	<div class="flex gap-2 items-center">
		<Checkbox
			label={$T('prdType.requireShip')}
			bind:checked={isShippingRequired}
			class="w-1/3"
			{disabled}
		/>

		<GraphqlPaginableSelect
			class="w-2/3"
			query={TAX_CLASSES_QUERY}
			resultKey="taxClasses"
			variables={{ first: 20 } as QueryTaxClassesArgs}
			optionValueKey="id"
			optionLabelKey="name"
			{disabled}
			label={$T('product.taxCls')}
			bind:value={taxClass}
		/>
	</div>
</div>
