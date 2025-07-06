<script lang="ts">
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
	}: Props = $props();

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;
	const APPLICATION_TYPES = [VoucherTypeEnum.EntireOrder, VoucherTypeEnum.SpecificProduct];
</script>

{#if discountType !== DISCOUNT_TYPE_SHIPPING}
	<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
		<div>
			<SectionHeader>Application type</SectionHeader>
			<div class="space-y-2.5">
				{#each APPLICATION_TYPES as type, idx (idx)}
					<RadioButton
						label={type.toLocaleLowerCase().split('_').join(' ')}
						bind:group={applicationType}
						value={type}
					/>
				{/each}

				<Checkbox
					label="Apply only to a single cheapest eligible product"
					subText="If this option is unchecked, discount will be counted for every eligible product"
					bind:checked={applyOncePerOrder}
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
			/>
		{/if}
	</div>
{/if}
