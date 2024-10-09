<script lang="ts">
	import { page } from '$app/stores';
	import type { Query, QueryProductVariantArgs } from '$lib/gql/graphql';
	import { operationStore, PRODUCT_VARIANTS_QUERY_STORE } from '$lib/stores/api';

	const { variant_sku } = $page.params;

  // const variantStore = operationStore<Pick<Query, 'productVariant'>, QueryProductVariantArgs>({
  //   kind: 'query',
  //   query: PRODUCT_VARIANTS_QUERY_STORE
  // });
</script>

<div></div>
