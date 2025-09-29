<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterManager } from '$lib/components/common/filter-box';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box/types';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import {
		CollectionPublished,
		type Channel,
		type CollectionFilterInput,
		type QueryCollectionsArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryCollectionsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

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
				eq: channelComponent,
			},
		},
		metadata: {
			label: $tranFunc('common.metadata'),
			operations: {
				eq: metadataComponent,
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

{#snippet channelComponent({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		value={initialValue as string}
		size="xs"
		valueType="slug"
		onchange={(opt) => onValue((opt as Channel)?.slug as FilterItemValue)}
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
	filterOptions={FilterOptions}
	bind:variables
	searchKey={'filter.search' as keyof QueryCollectionsArgs}
	bind:forceReExecuteGraphqlQuery
	extraVariablesFiltersPatching={(newVariables, params) => {
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
