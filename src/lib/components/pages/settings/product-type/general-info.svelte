<script lang="ts">
	import { tranFunc } from '$i18n';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { ProductTypeKindEnum, type QueryTaxClassesArgs } from '$lib/gql/graphql';

	type Props = {
		name: string;
		disabled?: boolean;
		kind: ProductTypeKindEnum;
		isShippingRequired: boolean;
		taxClass?: string;
	};

	let {
		name = $bindable(),
		disabled,
		kind = $bindable(),
		isShippingRequired = $bindable(),
		taxClass = $bindable(),
	}: Props = $props();
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-3">
	<SectionHeader>General information</SectionHeader>

	<Input label="Name" placeholder="Name" required bind:value={name} {disabled} />

	<div class="space-y-1">
		<RadioButton
			label="Normal product type"
			value={ProductTypeKindEnum.Normal}
			bind:group={kind}
			{disabled}
		/>
		<RadioButton
			value={ProductTypeKindEnum.GiftCard}
			bind:group={kind}
			subText="This product will act as payment method"
			{disabled}
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
		<Checkbox label="require shipping" bind:checked={isShippingRequired} class="w-1/3" />

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
