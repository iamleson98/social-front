<script lang="ts">
	import { page } from '$app/state';
	import { SHIPPING_ZONE_DETAIL_QUERY } from '$lib/api/admin/shipping';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ChannelListingPrice from '$lib/components/pages/settings/shipping-method/channel-listing-price.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-method/general-info.svelte';
	import PostalCodeRules from '$lib/components/pages/settings/shipping-method/postal-code-rules.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import type { Query, QueryShippingZoneArgs, ShippingPriceInput } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { onMount } from 'svelte';

	const shippingZoneQuery = operationStore<Pick<Query, 'shippingZone'>, QueryShippingZoneArgs>({
		kind: 'query',
		query: SHIPPING_ZONE_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
		requestPolicy: 'cache-and-network',
	});

	let shippingMethodInput = $state<ShippingPriceInput>({
		name: '',
		description: { blocks: [] },
		maximumDeliveryDays: 0,
		minimumDeliveryDays: 0,
		addPostalCodeRules: [],
		deletePostalCodeRules: [],
	});
	let loading = $state(false);
	let performUpdateMetadata = $state(false);
	let generalFormOk = $state(false);

	onMount(() =>
		shippingZoneQuery.subscribe((result) => {
			if (result.data?.shippingZone) {
				const { shippingMethods } = result.data.shippingZone;
				const shippingMethod = shippingMethods?.find(
					(method) => method.id === page.params.method_id,
				);
				if (shippingMethod) {
					shippingMethodInput = {
						name: shippingMethod.name,
						description: shippingMethod.description,
						maximumDeliveryDays: shippingMethod.maximumDeliveryDays,
						minimumDeliveryDays: shippingMethod.minimumDeliveryDays,
					};
				}
			}
		}),
	);
</script>

<div class="breadcrumbs text-sm">
	<ul>
		<li><a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id)}>Parent</a></li>
		<li>Shipping methods</li>
		<li>
			{page.params.method_id}
		</li>
	</ul>
</div>

{#if $shippingZoneQuery.fetching}
	<SelectSkeleton label />
{:else if $shippingZoneQuery.error}
	<Alert size="sm" bordered variant="error">{$shippingZoneQuery.error.message}</Alert>
{:else if $shippingZoneQuery.data?.shippingZone}
	{@const { shippingMethods } = $shippingZoneQuery.data.shippingZone}
	{@const shippingMethod = shippingMethods?.find((method) => method.id === page.params.method_id)}
	{@const availableChannels = $shippingZoneQuery.data.shippingZone.channels.map((item) => item.id)}

	{#if shippingMethod}
		<div class="space-y-2">
			<GeneralInfo
				disabled={loading}
				bind:name={shippingMethodInput.name!}
				bind:description={shippingMethodInput.description!}
				bind:maximumDeliveryDays={shippingMethodInput.maximumDeliveryDays!}
				bind:minimumDeliveryDays={shippingMethodInput.minimumDeliveryDays!}
				bind:ok={generalFormOk}
			/>
			<ChannelListingPrice
				shippingMethodChannelListings={shippingMethod.channelListings || []}
				shippingMethodChannelListingsInput={{}}
				{availableChannels}
			/>
			<PostalCodeRules
				existingCodeRules={shippingMethod.postalCodeRules || []}
				bind:addPostalCodeRules={shippingMethodInput.addPostalCodeRules!}
				bind:deletePostalCodeRules={shippingMethodInput.deletePostalCodeRules!}
			/>
			<GeneralMetadataEditor
				objectId={shippingMethod.id}
				bind:performUpdateMetadata
				metadata={shippingMethod.metadata}
				privateMetadata={shippingMethod.privateMetadata}
			/>
		</div>

		<ActionBar
			onUpdateClick={console.log}
			onDeleteClick={console.log}
			backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id)}
			disabled={loading}
		/>
	{/if}
{/if}
