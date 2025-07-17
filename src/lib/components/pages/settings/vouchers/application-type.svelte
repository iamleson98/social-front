<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
	import { DiscountValueTypeEnum, VoucherTypeEnum } from '$lib/gql/graphql';
	import { APPLICATION_TYPES } from './consts';
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
		onAssignCatalogItems: () => Promise<void>;
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
		onAssignCatalogItems,
		existingCategoriesCount,
		existingCollectionsCount,
		existingVariantsCount,
		existingProductsCount,

		disabled,
	}: Props = $props();

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;
</script>

{#if discountType !== DISCOUNT_TYPE_SHIPPING}
	<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
		<div>
			<SectionHeader>{$tranFunc('voucher.applyType')}</SectionHeader>
			<div class="space-y-2.5">
				{#each Object.keys(APPLICATION_TYPES) as type, idx (idx)}
					<RadioButton
						label={$tranFunc(APPLICATION_TYPES[type as VoucherTypeEnum])}
						bind:group={applicationType}
						value={type}
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
				{onAssignCatalogItems}
			/>
		{/if}
	</div>
{/if}
