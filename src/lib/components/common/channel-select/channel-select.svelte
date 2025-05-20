<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, SelectSkeleton, type SelectProps } from '$lib/components/ui/select';
	import type { Query } from '$lib/gql/graphql';

	let { value = $bindable(), size = 'md', ...rest }: Omit<SelectProps, 'options'> = $props();

	const channelStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});
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
			value: channel.slug,
		})) ?? []}
	<Select {options} {size} bind:value {...rest} />
{/if}
