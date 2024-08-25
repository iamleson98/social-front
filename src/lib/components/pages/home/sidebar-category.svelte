<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { Category, CategoryCountableEdge, Query } from '$lib/gql/graphql';
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/stores/api';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const cateLevel = 0;
	const first = 50;

	let categories = $state<CategoryCountableEdge[]>([]);

	onMount(async () => {
		const categoriesResult = await graphqlClient
			.query<Pick<Query, 'categories'>>(CATEGORIES_LIST_QUERY_STORE, {
				level: cateLevel,
				first
			})
			.toPromise();

		if (preHandleGraphqlResult(categoriesResult)) return;

		categories = categoriesResult.data?.categories?.edges || [];
	});
</script>

{#snippet category({ node }: CategoryCountableEdge)}
	<span>
		<Checkbox label={node.name} value={node.id} onchange={console.log} />
	</span>
{/snippet}

<AccordionList
	header="Categories"
	items={categories}
	partialDisplay={5}
	child={category}
	open
/>
