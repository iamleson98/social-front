<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SocialSize } from '$lib/components/ui/common';
	import {
		MultiSelect,
		Select,
		SelectSkeleton,
		type MultiSelectSizeType,
		type SelectOption,
	} from '$lib/components/ui/select';
	import type { Query } from '$lib/gql/graphql';

	type Props = {
		/** use this if you need single channel */
		value?: string;
		/** use this if you need multiple channels */
		values?: string[];
		size?: SocialSize;
		label?: string;
		onchange?: (value: string | string[]) => void;
		multiple?: boolean;
	};

	let {
		value = $bindable(''),
		values = $bindable([]),
		size = 'md',
		label,
		onchange,
		multiple = false,
	}: Props = $props();

	if (size === 'xs' && multiple) size = 'sm'; // since xs is not supported for multi select

	let selectedCHannels = $state<SelectOption[]>([]);
	const channelStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	const handleChange = () => {
		if (multiple) {
			values = selectedCHannels.map((item) => item.value as string);
			onchange?.(values);
		} else {
			onchange?.(value);
		}
	};
</script>

{#if $channelStore.fetching}
	<SelectSkeleton {size} />
{:else if $channelStore.error}
	<Alert variant="error" size="xs" bordered>
		{$channelStore.error.message}
	</Alert>
{:else if $channelStore.data}
	{@const options =
		$channelStore.data?.channels?.map((channel) => ({
			label: channel.name,
			value: channel.slug,
		})) ?? []}
	{#if multiple}
		<MultiSelect
			{options}
			bind:value={selectedCHannels}
			size={size as MultiSelectSizeType}
			{label}
			onchange={handleChange}
		/>
	{:else}
		<Select {options} bind:value {size} {label} onchange={handleChange} />
	{/if}
{/if}
