<script lang="ts">
	import { page } from '$app/state';
	import type { Query, QueryProductVariantArgs } from '$lib/gql/graphql';
	import { PRODUCT_VARIANTS_QUERY_STORE } from '$lib/stores/api';

	const { variant_sku } = page.params;

  // const variantStore = operationStore<Pick<Query, 'productVariant'>, QueryProductVariantArgs>({
  //   kind: 'query',
  //   query: PRODUCT_VARIANTS_QUERY_STORE
  // });
</script>

<div></div>
