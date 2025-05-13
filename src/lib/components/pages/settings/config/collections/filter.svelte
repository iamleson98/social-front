<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import { FilterButton } from '$lib/components/common/filter-box';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import type { CollectionFilterInput } from '$lib/gql/graphql';

	const FILTER_OPTIONS: FilterProps<CollectionFilterInput>[] = [
		{
			label: 'Is published',
			key: 'published',
			operations: [
				{
					operator: 'eq',
					component: publishedComponent
				}
			],
			mustPairWith: 'channel'
		},
		{
			label: 'Channel',
			key: 'channel',
			operations: [
				{
					operator: 'eq',
					component: channelComponent
				}
			]
		},
		{
			label: 'Metadata',
			key: 'metadata',
			operations: [
				{
					operator: 'eq',
					component: metadataComponent
				}
			]
		}
	];
</script>

{#snippet publishedComponent({ onValue, initialValue }: FilterComponentType)}
	<Checkbox
		size="sm"
		checked={initialValue as boolean}
		onchange={(evt) => onValue((evt.target as HTMLInputElement).checked)}
		label="Published"
	/>
{/snippet}

{#snippet channelComponent({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect value={initialValue as string} size="xs" onchange={onValue} />
{/snippet}

{#snippet metadataComponent({ onValue, initialValue = [] }: FilterComponentType)}
	{@const kv = [(initialValue as string[])[0] || '', (initialValue as string[])[1] || '']}
	<div class="flex flex-col gap-1.5">
		<Input
			size="xs"
			placeholder="key"
			value={kv[0]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				kv[0] = value;
				onValue(kv);
			}}
		/>
		<Input
			size="xs"
			placeholder="value"
			value={kv[1]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				kv[1] = value;
				onValue(kv);
			}}
		/>
	</div>
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} />
