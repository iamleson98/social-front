<script lang="ts">
	import { tranFunc } from '$i18n';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import type { ProductInput, QueryCollectionsArgs, QueryTaxClassesArgs } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		collections: ProductInput['collections'];
		taxClassID: ProductInput['taxClass'];
		loading: boolean;
	};

	let { collections = $bindable([]), taxClassID = $bindable(), loading }: Props = $props();
</script>

<div class={[SitenameCommonClassName, 'flex gap-2']}>
	<!-- MARK: Collections -->
	<div class="w-1/2 mobile-l:w-full">
		<GraphqlPaginableSelect
			query={COLLECTIONS_QUERY}
			resultKey="collections"
			variableSearchQueryPath="filter.search"
			variables={{ first: 20, filter: { search: '' } } as QueryCollectionsArgs}
			optionValueKey="id"
			optionLabelKey="name"
			disabled={loading}
			multiple
			label={$tranFunc('product.collection')}
			bind:value={collections as string[]}
		/>
	</div>

	<!-- MARK: Tax classes -->
	<div class="w-1/2 mobile-l:w-full">
		<GraphqlPaginableSelect
			query={TAX_CLASSES_QUERY}
			resultKey="taxClasses"
			variables={{ first: 20 } as QueryTaxClassesArgs}
			optionValueKey="id"
			optionLabelKey="name"
			disabled={loading}
			label={$tranFunc('product.taxCls')}
			bind:value={taxClassID as string}
		/>
	</div>
</div>
