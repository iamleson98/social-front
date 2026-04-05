<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		DELETE_SHIPPING_ZONE_MUTATION,
		SHIPPING_ZONE_DETAIL_QUERY,
		UPDATE_SHIPPING_ZONE_MUTATION,
	} from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/shipping-zones/detail-skeleton.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-zones/general-info.svelte';
	import ShippingMethods from '$lib/components/pages/settings/shipping-zones/shipping-methods.svelte';
	import SubSection from '$lib/components/pages/settings/shipping-zones/sub-section.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type Mutation,
		type MutationShippingZoneDeleteArgs,
		type MutationShippingZoneUpdateArgs,
		type Query,
		type QueryShippingZoneArgs,
		type ShippingZoneUpdateInput,
	} from '$lib/gql/graphql';
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const shippingZoneQuery = operationStore<Pick<Query, 'shippingZone'>, QueryShippingZoneArgs>({
		query: SHIPPING_ZONE_DETAIL_QUERY,
		variables: {
			id: page.params.id as string,
		},
		pause: !page.params.id,
	});

	let metaRef = $state<GeneralMetadataEditorRef>();
	let loading = $state(false);
	let generalFormOk = $state(false);

	let shippingZoneInput = $state<ShippingZoneUpdateInput>({
		name: '',
		description: '',
		default: false,
		addWarehouses: [],
		removeWarehouses: [],
		addChannels: [],
		removeChannels: [],
	});

	const handleDeleteZone = async () => {
		AlertModalStore.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'shippingZoneDelete'>,
					MutationShippingZoneDeleteArgs
				>(DELETE_SHIPPING_ZONE_MUTATION, {
					id: page.params.id!,
				});
				loading = false;

				if (
					!checkIfGraphqlResultHasError(result, 'shippingZoneDelete', $CommonState.DeleteSuccess)
				) {
					await goto(AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES());
				}
			},
		});
	};

	const handleUpdateZone = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shippingZoneUpdate'>,
			MutationShippingZoneUpdateArgs
		>(UPDATE_SHIPPING_ZONE_MUTATION, {
			id: page.params.id!,
			input: shippingZoneInput,
		});

		if (checkIfGraphqlResultHasError(result, 'shippingZoneUpdate')) {
			loading = false;
			return;
		}

		const hasErr = await metaRef?.handleUpdate();
		loading = false;
		if (hasErr) return;

		onDoneUpdateMethods();
	};

	onMount(() =>
		shippingZoneQuery.subscribe((result) => {
			if (result.data?.shippingZone) {
				const { name, description, default: defaultZone } = result.data.shippingZone;
				shippingZoneInput = {
					name,
					description: description || '',
					default: defaultZone,
				};
			}
		}),
	);

	const onDoneUpdateMethods = () => {
		shippingZoneQuery.reexecute({
			context: { requestPolicy: 'network-only' },
			variables: { id: page.params.id! },
		});
	};
</script>

{#if $shippingZoneQuery.fetching}
	<DetailSkeleton />
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
				countries={countries.map((country) => country.code)}
				bind:isDefault={shippingZoneInput.default!}
				bind:formOk={generalFormOk}
			/>
			<ShippingMethods
				shippingMethods={shippingMethods || []}
				onDoneUpdate={onDoneUpdateMethods}
				disabled={loading}
			/>
			<GeneralMetadataEditor
				{metadata}
				{privateMetadata}
				objectId={id}
				bind:this={metaRef}
				disabled={loading}
			/>
		</div>

		<SubSection
			{channels}
			{warehouses}
			bind:addWarehouses={shippingZoneInput.addWarehouses!}
			bind:removeWarehouses={shippingZoneInput.removeWarehouses!}
			bind:addChannels={shippingZoneInput.addChannels!}
			bind:removeChannels={shippingZoneInput.removeChannels!}
			disabled={loading}
		/>
	</div>

	<ActionBar
		onUpdateClick={handleUpdateZone}
		onDeleteClick={handleDeleteZone}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES()}
		disabled={loading}
		disableUpdateButton={!generalFormOk}
	/>
{/if}
