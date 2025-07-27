<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		CREATE_SHIPPING_METHOD_MUTATION,
		SHIPPING_ZONE_DETAIL_QUERY,
	} from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import AddMethodScreenChannelListingPrice from '$lib/components/pages/settings/shipping-method/add-method-screen-channel-listing-price.svelte';
	import ChannelListingPriceBased from '$lib/components/pages/settings/shipping-method/channel-listing-price.svelte';
	import ChannelListingWeight from '$lib/components/pages/settings/shipping-method/channel-listing-weight.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-method/general-info.svelte';
	import PostalCodeRules from '$lib/components/pages/settings/shipping-method/postal-code-rules.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/shipping-zones/detail-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Mutation,
		type MutationShippingPriceCreateArgs,
		type Query,
		type QueryShippingZoneArgs,
		type ShippingMethodChannelListingInput,
		type ShippingPriceInput,
	} from '$lib/gql/graphql';
	import { ActiveShippingZone } from '$lib/stores/shipping';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	const shippingZoneQuery = operationStore<Pick<Query, 'shippingZone'>, QueryShippingZoneArgs>({
		kind: 'query',
		query: SHIPPING_ZONE_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let shippingMethodInput = $state<ShippingPriceInput>({
		shippingZone: page.params.id,
		name: '',
		description: { blocks: [] },
		maximumDeliveryDays: 0,
		minimumDeliveryDays: 0,
		addPostalCodeRules: [],
	});
	let createdMethodId = $state('');
	let performUpdateMetadata = $state(false);
	let generalFormOk = $state(false);
	let shippingMethodChannelListingsInput = $state<ShippingMethodChannelListingInput>({
		addChannels: [],
	});

	const methodType = $derived(page.url.searchParams.get('type'));

	const handleCreateMethod = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shippingPriceCreate'>,
			MutationShippingPriceCreateArgs
		>(CREATE_SHIPPING_METHOD_MUTATION, {
			input: shippingMethodInput,
		});
		loading = false;

		if (
			!checkIfGraphqlResultHasError(
				result,
				'shippingPriceCreate',
				$tranFunc('common.createSuccess'),
			)
		) {
			createdMethodId = result.data?.shippingPriceCreate?.shippingMethod?.id!;
		}
	};
</script>

<div class="breadcrumbs text-sm">
	<ul>
		<li><a href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id)}>Parent</a></li>
		<li>Shipping methods</li>
		<li>New</li>
	</ul>
</div>

{#if $shippingZoneQuery.fetching}
	<DetailSkeleton />
{:else if $shippingZoneQuery.error}
	<Alert size="sm" bordered variant="error">{$shippingZoneQuery.error.message}</Alert>
{:else if $shippingZoneQuery.data?.shippingZone}
	{@const availableChannels = $shippingZoneQuery.data.shippingZone.channels}
	<div class="space-y-2">
		<GeneralInfo
			disabled={loading}
			bind:name={shippingMethodInput.name!}
			bind:description={shippingMethodInput.description!}
			bind:maximumDeliveryDays={shippingMethodInput.maximumDeliveryDays!}
			bind:minimumDeliveryDays={shippingMethodInput.minimumDeliveryDays!}
			bind:ok={generalFormOk}
		/>
		{#if methodType === 'price'}
			<AddMethodScreenChannelListingPrice
				bind:shippingMethodChannelListingsInput
				{availableChannels}
			/>
		{:else if methodType === 'weight'}
			<ChannelListingWeight isCreatePage />
		{/if}
		<PostalCodeRules
			bind:addPostalCodeRules={shippingMethodInput.addPostalCodeRules!}
			bind:deletePostalCodeRules={shippingMethodInput.deletePostalCodeRules!}
		/>
		<GeneralMetadataEditor objectId={createdMethodId} bind:performUpdateMetadata />
	</div>

	<ActionBar
		onAddClick={handleCreateMethod}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id)}
		disabled={loading}
		disableCreateButton={!generalFormOk || loading}
	/>
{/if}
