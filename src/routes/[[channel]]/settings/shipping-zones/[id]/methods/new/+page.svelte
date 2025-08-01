<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		CREATE_SHIPPING_METHOD_MUTATION,
		SHIPPING_METHOD_CHANNEL_LISTING_UPDATE_MUTATION,
		SHIPPING_ZONE_DETAIL_QUERY,
	} from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import AddMethodScreenChannelListingPrice from '$lib/components/pages/settings/shipping-method/add-method-screen-channel-listing-price.svelte';
	import ChannelListingWeight from '$lib/components/pages/settings/shipping-method/channel-listing-weight.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-method/general-info.svelte';
	import PostalCodeRules from '$lib/components/pages/settings/shipping-method/postal-code-rules.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/shipping-zones/detail-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		PostalCodeRuleInclusionTypeEnum,
		ShippingMethodTypeEnum,
		type Mutation,
		type MutationShippingMethodChannelListingUpdateArgs,
		type MutationShippingPriceCreateArgs,
		type Query,
		type QueryShippingZoneArgs,
		type ShippingMethodChannelListingInput,
		type ShippingPriceInput,
	} from '$lib/gql/graphql';
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
	const methodType = $derived(page.url.searchParams.get('type') as ShippingMethodTypeEnum);

	let shippingMethodInput = $state<ShippingPriceInput>({
		shippingZone: page.params.id,
		name: '',
		description: { blocks: [] },
		maximumDeliveryDays: 0,
		minimumDeliveryDays: 0,
		addPostalCodeRules: [],
		inclusionType: PostalCodeRuleInclusionTypeEnum.Include,
		type: page.url.searchParams.get('type') as ShippingMethodTypeEnum,
		minimumOrderWeight: 0,
		maximumOrderWeight: 0,
	});
	let createdMethodId = $state('');
	let performUpdateMetadata = $state(false);
	let generalFormOk = $state(false);
	let shippingMethodChannelListingsInput = $state<ShippingMethodChannelListingInput>({
		addChannels: [],
	});

	const handleCreateMethod = async () => {
		if (!generalFormOk) return;

		loading = true;

		// 1) create method
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shippingPriceCreate'>,
			MutationShippingPriceCreateArgs
		>(CREATE_SHIPPING_METHOD_MUTATION, {
			input: {
				...shippingMethodInput,
				description: shippingMethodInput.description
					? JSON.stringify(shippingMethodInput.description)
					: null,
			},
		});

		if (checkIfGraphqlResultHasError(result, 'shippingPriceCreate')) return;

		createdMethodId = result.data?.shippingPriceCreate?.shippingMethod?.id!;
		performUpdateMetadata = true;

		// 2) update channel listings
		const listingUpdateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shippingMethodChannelListingUpdate'>,
			MutationShippingMethodChannelListingUpdateArgs
		>(SHIPPING_METHOD_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: createdMethodId,
			input: shippingMethodChannelListingsInput,
		});

		if (
			(checkIfGraphqlResultHasError(listingUpdateResult, 'shippingMethodChannelListingUpdate'),
			$tranFunc('common.createSuccess'))
		)
			return;

		await goto(
			AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_DETAILS(page.params.id!, createdMethodId),
		);
	};
</script>

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
		{#if methodType === ShippingMethodTypeEnum.Price}
			<AddMethodScreenChannelListingPrice
				bind:shippingMethodChannelListingsInput
				{availableChannels}
			/>
		{:else if methodType === ShippingMethodTypeEnum.Weight}
			<ChannelListingWeight
				isCreatePage
				bind:minimumOrderWeight={shippingMethodInput.minimumOrderWeight!}
				bind:maximumOrderWeight={shippingMethodInput.maximumOrderWeight!}
			/>
		{/if}
		<PostalCodeRules
			bind:addPostalCodeRules={shippingMethodInput.addPostalCodeRules!}
			bind:inclusionType={shippingMethodInput.inclusionType!}
			deletePostalCodeRules={[]}
		/>
		<GeneralMetadataEditor objectId={createdMethodId} bind:performUpdateMetadata />
	</div>

	<ActionBar
		onAddClick={handleCreateMethod}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(page.params.id!)}
		disabled={loading}
		disableCreateButton={!generalFormOk || loading}
	/>
{/if}
