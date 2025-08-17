<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, SelectSkeleton, type SelectProps } from '$lib/components/ui/select';
	import type { Channel, Query } from '$lib/gql/graphql';

	let {
		value = $bindable(),
		size = 'md',
		valueType = 'slug',
		onchange,
		...rest
	}: Omit<SelectProps, 'options' | 'onchange'> & {
		/** thr returned values should be channel ids or channel slugs */
		valueType?: 'id' | 'slug';
		onchange?: (value?: Channel | Channel[]) => void;
	} = $props();

	const channelStore = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	const innerOnchange = () => {
		if (!value) onchange?.();
		else if (rest.multiple) {
			const channels = $channelStore.data?.channels?.filter((chan) => {
				if (valueType === 'id') return value.includes(chan.id);
				return value.includes(chan.slug);
			});
			onchange?.(channels);
		} else {
			const channel = $channelStore.data?.channels?.find((chan) => {
				if (valueType === 'id') return chan.id === value;
				return chan.slug === value;
			});
			onchange?.(channel);
		}
	};
</script>

{#if $channelStore.fetching}
	<SelectSkeleton {size} label={!!rest.label} />
{:else if $channelStore.error}
	<Alert variant="error" {size} bordered>
		{$channelStore.error.message}
	</Alert>
{:else if $channelStore.data}
	{@const options =
		$channelStore.data?.channels?.map((channel) => ({
			label: channel.name,
			value: valueType === 'slug' ? channel.slug : channel.id,
		})) ?? []}
	<Select {options} {size} bind:value {...rest} onchange={innerOnchange} />
{/if}
