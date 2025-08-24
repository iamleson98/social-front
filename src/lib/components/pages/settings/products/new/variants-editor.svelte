<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_VALUES_QUERY } from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Icon, Plus } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		GraphqlPaginableSelect,
		Select,
		SelectSkeleton,
		type SelectOption,
	} from '$lib/components/ui/select';
	import type {
		ProductVariantBulkCreateInput,
		Query,
		QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		productTypeId: string;
	};

	let { productTypeId }: Props = $props();

	type VariantManifest = {
		attribute: {
			id: string;
			name: string;
		};
		values: string[];
	};

	const MAX_VARIANT_TYPES = 2;

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: '',
		},
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	let variantManifests = $state<VariantManifest[]>([]);

	const AvailableAttributeOptions = $derived(
		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes
			?.filter(
				(attr) =>
					attr.variantSelection &&
					!variantManifests.some((manifest) => manifest.attribute.id === attr.attribute.id),
			)
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

	const handleAddVariantManifest = async () => {
		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});
	};
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
		<div class="grid grid-cols-2 gap-2">
			{#each variantManifests as manifest, idx (idx)}
				<div class="space-y-2">
					<Select
						placeholder="Select an attribute"
						label="Select an attribute"
						options={AvailableAttributeOptions}
						onchange={handleAttributeSelect}
						bind:value={manifest.attribute.id}
					/>

					{#if manifest.attribute.id}
						<GraphqlPaginableSelect
							query={ATTRIBUTE_VALUES_QUERY}
							variables={{ id: manifest.attribute.id, first: 15 }}
							resultKey={'attribute.choices' as keyof Query}
							optionValueKey="id"
							optionLabelKey="name"
							multiple
							bind:value={manifest.values}
							size="sm"
						/>
					{/if}
				</div>
			{/each}
			{#if variantManifests.length < MAX_VARIANT_TYPES && AvailableAttributeOptions.length}
				<button
					class={[
						'border-dashed border w-full h-full flex items-center justify-center rounded-lg tooltip tooltip-top border-blue-500 text-blue-500 cursor-pointer py-5 hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50',
					]}
					onclick={handleAddVariantManifest}
					data-tip={$tranFunc('product.addVariant')}
					aria-label={$tranFunc('product.addVariant')}
				>
					<Icon icon={Plus} size="xl" />
				</button>
			{/if}
		</div>
	{/if}
</div>
