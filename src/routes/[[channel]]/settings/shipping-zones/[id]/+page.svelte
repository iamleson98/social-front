<script lang="ts">
	import { page } from '$app/state';
	import {
		DELETE_SHIPPING_ZONE_MUTATION,
		SHIPPING_ZONE_DETAIL_QUERY,
	} from '$lib/api/admin/shipping';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-zones/general-info.svelte';
	import ShippingMethods from '$lib/components/pages/settings/shipping-zones/shipping-methods.svelte';
	import SubSection from '$lib/components/pages/settings/shipping-zones/sub-section.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		type Mutation,
		type MutationShippingZoneDeleteArgs,
		type Query,
		type QueryShippingZoneArgs,
		type ShippingZoneUpdateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { onMount } from 'svelte';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { tranFunc } from '$i18n';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { goto } from '$app/navigation';

	const shippingZoneQuery = operationStore<Pick<Query, 'shippingZone'>, QueryShippingZoneArgs>({
		kind: 'query',
		query: SHIPPING_ZONE_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

	let performUpdateMetadata = $state(false);
	let loading = $state(true);

	let shippingZoneInput = $state<ShippingZoneUpdateInput>({
		name: '',
		description: '',
	});

	onMount(() => (loading = false));

	const handleDeleteZone = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'shippingZoneDelete'>,
					MutationShippingZoneDeleteArgs
				>(DELETE_SHIPPING_ZONE_MUTATION, {
					id: page.params.id,
				});
				loading = false;

				if (
					!checkIfGraphqlResultHasError(
						result,
						'shippingZoneDelete',
						$tranFunc('common.delSuccess'),
					)
				) {
					await goto(AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES());
				}
			},
		});
	};

	const handleUpdateZone = async () => {};
</script>

{#if $shippingZoneQuery.fetching}
	<SelectSkeleton label />
{:else if $shippingZoneQuery.error}
	<Alert size="sm" bordered variant="error">{$shippingZoneQuery.error.message}</Alert>
{:else if $shippingZoneQuery.data?.shippingZone}
	{@const { metadata, privateMetadata, id, countries, channels, warehouses, shippingMethods } =
		$shippingZoneQuery.data.shippingZone}

	<div class="flex gap-2">
		<div class="w-6/10 space-y-2">
			<GeneralInfo
				bind:name={shippingZoneInput.name!}
				bind:description={shippingZoneInput.description!}
				disabled={loading}
				{countries}
			/>
			<ShippingMethods shippingMethods={shippingMethods || []} />
			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				objectId={id}
				bind:performUpdateMetadata
				disabled={loading}
			/>
		</div>

		<SubSection {channels} {warehouses} />
	</div>

	<ActionBar
		onUpdateClick={handleUpdateZone}
		onDeleteClick={handleDeleteZone}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES()}
		disabled={loading}
	/>
{/if}
