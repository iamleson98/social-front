<script lang="ts">
	import CategorySelector from '$lib/components/pages/products/category-selector.svelte';
	import ProductDescriptionEditor from '$lib/components/pages/products/product-description-editor.svelte';

	let now = new Date();
</script>

<div class="m-auto rounded bg-white max-w-[800px] p-5">
	<!-- product name -->
	<label class="form-control w-full">
		<div class="label">
			<span class="label-text text-lg font-semibold">Product name</span>
			<!-- <span class="label-text-alt">Top Right label</span> -->
		</div>
		<input type="text" placeholder="Enter the product name" class="input input-bordered w-full" />
		<div class="label">
			<span class="label-text-alt"></span>
			<span class="label-text-alt">{now.toDateString()}</span>
		</div>
	</label>

	<!-- description -->
	<div class="label">
		<span class="label-text text-lg font-semibold">Product description</span>
	</div>
	<ProductDescriptionEditor />

	<!-- category -->
	<CategorySelector />

	<!-- variants -->
	<div class="flex items-center"></div>
</div>
