<script lang="ts">
	import { type SelectOption } from '$lib/components/ui/select';
	import type { Checkout, Query, QueryChannelArgs } from '$lib/gql/graphql';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { getCountryName } from '$lib/utils/address';
	import AddressForm from './address-form.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: checkout.channel.slug
		},
		pause: !checkout.channel.slug
	});
</script>

{#if $channelStore.fetching}
	<div>Loading...</div>
{:else if $channelStore.error}
	<div>{$channelStore.error.message}</div>
{:else}
	{@const countrySelectOptions =
		$channelStore.data?.channel?.countries?.map<SelectOption>(({ code }) => ({
			value: code,
			label: getCountryName(code)
		})) || []}
	<AddressForm {countrySelectOptions} onSubmit={console.log} />
{/if}
