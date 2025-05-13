<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SocialSize } from '$lib/components/ui/common';
	import {
		MultiSelect,
		Select,
		type MultiSelectSizeType,
		type SelectOption
	} from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query } from '$lib/gql/graphql';

	type Props = {
		/** use this if you need single channel */
		value?: string | null;
		/** use this if you need multiple channels */
		values?: string[];
		size?: SocialSize;
		label?: string;
		onchange?: (value: string | string[]) => void;
	};

	let {
		value = $bindable(),
		values = $bindable(),
		size = 'md',
		label,
		onchange
	}: Props = $props();

	if (size === 'xs' && values) size = 'sm'; // since xs is not supported for multi select

	if ((value === undefined && values === undefined) || (value !== undefined && values !== undefined)) {
		throw new Error('please provide either value or values, not both');
	}

	let multiChannels = $state<SelectOption[]>([]);

	$effect(() => {
		values = multiChannels.map((channel) => channel.value as string);
	});

	const channelStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network'
	});
</script>

{#if $channelStore.fetching}
	<SkeletonContainer class="h-full">
		<Skeleton class="h-4 w-full" />
	</SkeletonContainer>
{:else if $channelStore.error}
	<Alert variant="error" size="xs" bordered>
		{$channelStore.error.message}
	</Alert>
{:else if $channelStore.data}
	{@const options =
		$channelStore.data?.channels?.map((channel) => ({
			label: channel.name,
			value: channel.slug
		})) ?? []}
	{#if value}
		<Select
			{options}
			bind:value
			{size}
			{label}
			onchange={(opt) => opt && onchange?.(opt.value as string)}
		/>
	{:else if values}
		<MultiSelect
			{options}
			bind:value={multiChannels}
			size={size as MultiSelectSizeType}
			{label}
			onchange={(opts) => {
				opts?.length && onchange?.(opts.map((opt) => opt.value as string));
			}}
		/>
	{/if}
{/if}
