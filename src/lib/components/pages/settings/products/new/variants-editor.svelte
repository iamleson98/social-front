<script lang="ts">
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import type {
		ProductVariantBulkCreateInput,
		Query,
		QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type VariantType = {};

	type Props = {
		productTypeId: string;
	};

	let { productTypeId }: Props = $props();

	$inspect(productTypeId);

	const MAX_VARIANT_TYPES = 2;

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: '',
		},
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	const AvailableAttributeOptions = $derived(
		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes
			?.filter((attr) => attr.variantSelection)
			.map<SelectOption>((attr) => ({
				value: attr.attribute.id,
				label: (attr.attribute.name || attr.attribute.slug) as string,
			})) || [],
	);

	$effect(() => {
		if (productTypeId)
			ProductTypeDetailQuery.reexecute({
				variables: { id: productTypeId },
			});
	});

	let variantsInput = $state<ProductVariantBulkCreateInput[]>([]);

	const handleAttributeSelect = (opt?: SelectOption | SelectOption[]) => {};
</script>

<div class={SitenameCommonClassName}>
	{#if $ProductTypeDetailQuery.fetching}
		<div class="grid grid-cols-2 gap-2">
			<SelectSkeleton label />
			<SelectSkeleton label />
		</div>
	{:else if $ProductTypeDetailQuery.error}
		<Alert variant="error" size="sm">{$ProductTypeDetailQuery.error.message}</Alert>
	{:else if $ProductTypeDetailQuery.data?.productType}
		{@const { assignedVariantAttributes } = $ProductTypeDetailQuery.data.productType}
		<!-- only show select for user to choose when product type has variant selection attributes -->
		{#if assignedVariantAttributes?.length}
			<div>
				{#each variantsInput as variantInput, idx (idx)}
					<div></div>
				{/each}
			</div>
		{/if}
		{#if variantsInput.length < MAX_VARIANT_TYPES && AvailableAttributeOptions.length}
			<Select
				placeholder="Select an attribute"
				label="Select an attribute"
				options={AvailableAttributeOptions}
				onchange={handleAttributeSelect}
			/>
		{/if}
	{/if}
</div>
