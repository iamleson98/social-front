<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInfo from '$lib/components/pages/settings/product-type/general-info.svelte';
	import ProductAttributes from '$lib/components/pages/settings/product-type/product-attributes.svelte';
	import VariantAttributes from '$lib/components/pages/settings/product-type/variant-attributes.svelte';
	import type { ProductTypeInput } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let productTypeInput = $state<ProductTypeInput>({
		hasVariants: false,
	});
	let loading = $state(false);
	let createdProductTypeId = $state<string>('');
	let performUpdateMetadata = $state(false);

	const onAddClick = async () => {};
</script>

<div class="space-y-2">
	<GeneralInfo
		bind:name={productTypeInput.name!}
		disabled={loading}
		bind:kind={productTypeInput.kind!}
		bind:isShippingRequired={productTypeInput.isShippingRequired!}
		bind:taxClass={productTypeInput.taxClass!}
	/>
	<ProductAttributes />
	<VariantAttributes
		bind:hasVariants={productTypeInput.hasVariants!}
		assignedVariantAttributes={[]}
	/>

	<GeneralMetadataEditor objectId={createdProductTypeId} bind:performUpdateMetadata />
</div>

<ActionBar disabled={loading} backButtonUrl={AppRoute.SETTINGS_PRODUCT_TYPES()} {onAddClick} />
