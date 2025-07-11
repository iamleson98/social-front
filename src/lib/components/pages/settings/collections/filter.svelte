<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box/types';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import {
		CollectionPublished,
		type CollectionFilterInput,
		type QueryCollectionsArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryCollectionsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FILTER_OPTIONS: FilterProps<CollectionFilterInput>[] = $derived([
		{
			label: $tranFunc('product.published'),
			key: 'published',
			operations: [
				{
					operator: 'eq',
					component: publishedComponent,
				},
			],
			mustPairWith: 'channel',
		},
		{
			label: $tranFunc('product.channel'),
			key: 'channel',
			operations: [
				{
					operator: 'eq',
					component: channelComponent,
				},
			],
		},
		{
			label: $tranFunc('common.metadata'),
			key: 'metadata',
			operations: [
				{
					operator: 'eq',
					component: metadataComponent,
				},
			],
		},
	]);
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

{#snippet channelComponent({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		value={initialValue as string}
		size="xs"
		onchange={(opt) => onValue(opt?.id as FilterItemValue)}
	/>
{/snippet}

{#snippet metadataComponent({ onValue, initialValue = [] }: FilterComponentType)}
	{@const keyValue = [(initialValue as string[])[0] || '', (initialValue as string[])[1] || '']}
	<div class="flex flex-col gap-1.5">
		<Input
			size="xs"
			placeholder={$tranFunc('common.key')}
			value={keyValue[0]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[0] = value;
				onValue(keyValue);
			}}
		/>
		<Input
			size="xs"
			placeholder={$tranFunc('common.value')}
			value={keyValue[1]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[1] = value;
				onValue(keyValue);
			}}
		/>
	</div>
{/snippet}

<FilterManager
	filterOptions={FILTER_OPTIONS}
	bind:variables
	searchKey={'filter.search' as keyof QueryCollectionsArgs}
	bind:forceReExecuteGraphqlQuery
/>
