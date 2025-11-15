<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type {
		FilterComponentType,
		FilterProps,
	} from '$lib/components/common/filter-box/types';
	import { Checkbox } from '$lib/components/ui/Input';
	import { reFetchTableData } from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import {
		CollectionPublished,
		type CollectionFilterInput,
		type QueryCollectionsArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryCollectionsArgs;
	};

	let { variables = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<CollectionFilterInput> = $derived({
		published: {
			label: $tranFunc('product.published'),
			operations: {
				eq: publishedComponent,
			},
			mustPairWith: 'channel',
		},
		channel: {
			label: $tranFunc('product.channel'),
			operations: {
				eq: CommonSnippets.singleChannelSlug,
			},
		},
		metadata: {
			label: $tranFunc('common.metadata'),
			operations: {
				eq: CommonSnippets.metadata,
			},
		},
	});
</script>

{#snippet publishedComponent({ onValue, initialValue }: FilterComponentType)}
	<Checkbox
		size="sm"
		label={$tranFunc('product.published')}
		checked={initialValue === CollectionPublished.Published}
		onchange={(evt) => {
			onValue(
				evt.currentTarget.checked ? CollectionPublished.Published : CollectionPublished.Hidden,
			);
		}}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	searchKey={'filter.search' as keyof QueryCollectionsArgs}
	onRefetchData={() => reFetchTableData(TableNameKeys.CollectionListTable)}
	variablePatchingCallbackAfterReload={(newVariables, params) => {
		const { published, channel, metadata } = params;

		if (!newVariables.filter) newVariables.filter = {};

		if (published)
			newVariables.filter.published = published.value
				? CollectionPublished.Published
				: CollectionPublished.Hidden;

		if (metadata && Array.isArray(metadata.value))
			newVariables.filter.metadata = [
				{
					key: metadata.value[0] as string,
					value: metadata.value[1] as string,
				},
			];

		if (channel) newVariables.channel = channel.value as string;

		return newVariables;
	}}
/>
