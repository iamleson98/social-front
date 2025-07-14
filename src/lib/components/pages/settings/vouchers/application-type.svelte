<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
	import { DiscountValueTypeEnum, VoucherTypeEnum } from '$lib/gql/graphql';
	import VoucherCatalogApplication from './voucher-catalog-application.svelte';

	type Props = {
		discountType: DiscountValueTypeEnum;
		applicationType: VoucherTypeEnum;
		applyOncePerOrder: boolean;

		newCategories: string[];
		newProducts: string[];
		newCollections: string[];
		newVariants: string[];

		existingCategoriesCount: number;
		existingCollectionsCount: number;
		existingVariantsCount: number;
		existingProductsCount: number;

		disabled?: boolean;
	};

	let {
		discountType,
		applicationType = $bindable(),
		applyOncePerOrder = $bindable(),
		newCategories = $bindable(),
		newProducts = $bindable(),
		newCollections = $bindable(),
		newVariants = $bindable(),

		existingCategoriesCount,
		existingCollectionsCount,
		existingVariantsCount,
		existingProductsCount,

		disabled,
	}: Props = $props();

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;
	const APPLICATION_TYPES = [
		{
			value: VoucherTypeEnum.EntireOrder,
			label: 'voucher.applyEntireOrder',
		},
		{
			value: VoucherTypeEnum.SpecificProduct,
			label: 'voucher.applySpecificPrd',
		},
	];
</script>

{#if discountType !== DISCOUNT_TYPE_SHIPPING}
	<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
		<div>
			<SectionHeader>{$tranFunc('voucher.applyType')}</SectionHeader>
			<div class="space-y-2.5">
				{#each APPLICATION_TYPES as type, idx (idx)}
					<RadioButton
						label={$tranFunc(type.label)}
						bind:group={applicationType}
						value={type.value}
						{disabled}
					/>
				{/each}

				<Checkbox
					label={$tranFunc('voucher.applyCheapPrd')}
					subText={$tranFunc('voucher.applyCheapPrdHelpTxt')}
					bind:checked={applyOncePerOrder}
					{disabled}
				/>
			</div>
		</div>
		{#if applicationType === VoucherTypeEnum.SpecificProduct}
			<VoucherCatalogApplication
				bind:newCategories
				bind:newCollections
				bind:newProducts
				bind:newVariants
				{existingCategoriesCount}
				{existingCollectionsCount}
				{existingProductsCount}
				{existingVariantsCount}
				{disabled}
			/>
		{/if}
	</div>
{/if}
