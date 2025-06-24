<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNEL_DETAILS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		Select,
		SelectSkeleton,
		type SelectProps,
		type SelectOption,
	} from '$lib/components/ui/select';
	import type { Query, QueryChannelArgs } from '$lib/gql/graphql';

	type Props = {
		/**
		 * Channel slug
		 */
		channelSlug: string;
	} & Omit<SelectProps, 'options'>;

	let { value = $bindable(), channelSlug: slug, ...rest }: Props = $props();

	const CHANEL_STORE = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY,
		variables: {
			slug,
		},
		requestPolicy: 'cache-and-network',
	});
</script>

<div class={rest.class || ''}>
	{#if $CHANEL_STORE.fetching}
		<SelectSkeleton size={rest.size} label={!!rest.label} />
	{:else if $CHANEL_STORE.error}
		<Alert variant="error" size={rest.size} bordered>{$CHANEL_STORE.error.message}</Alert>
	{:else if $CHANEL_STORE.data?.channel?.countries}
		{@const options = $CHANEL_STORE.data.channel.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		}))}
		<Select
			{options}
			placeholder={$tranFunc('placeholders.valuePlaceholder')}
			bind:value
			{...rest}
		/>
	{/if}
</div>
