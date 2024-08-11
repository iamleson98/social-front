<script lang="ts">
	import CategorySelector from '$lib/components/pages/products/category-selector.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/product-attribute-editor.svelte';
	import ProductDescriptionEditor from '$lib/components/pages/products/product-description-editor.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/product-variant-creator.svelte';
	import type { Category } from '$lib/gql/graphql';

	let now = new Date();

	let productCategory = $state<Category | null>(null);
</script>

<div class="m-auto rounded bg-white max-w-[800px] p-5 text-gray-600">
	<!-- product name -->
	<div class="mb-3">
		<span class="text-sm">Product name</span>
		<input
			type="text"
			placeholder="Enter the product name"
			class="input input-sm w-full bg-gray-50"
		/>
		<div class="text-right">
			<span class="text-xs">{now.toDateString()}</span>
		</div>
	</div>

	<!-- category -->
	<div class="mb-3">
		<span class="text-sm">Choose category</span>
		<CategorySelector onCategorySelected={(cate) => (productCategory = cate)} />
	</div>

	<!-- description -->
	<div class="mb-3">
		<span class="text-sm">Product description</span>
		<div class="bg-gray-50 rounded p-2">
			<ProductDescriptionEditor />
		</div>
	</div>

	<!-- attributes -->
	{#if productCategory}
		<div class="mb-3">
			<span class="text-sm">Product attributes</span>
			<div class="bg-gray-50 rounded p-2">
				<ProductAttributeEditor {productCategory} />
			</div>
		</div>
	{/if}

	<!-- variants -->
	<div class="mb-3">
		<span class="text-sm">Add product variants</span>
		<div class="bg-gray-50 rounded p-2">
			<ProductVariantCreator />
		</div>
	</div>
</div>
