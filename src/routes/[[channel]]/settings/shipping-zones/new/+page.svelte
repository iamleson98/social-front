<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { SHIPPING_ZONE_CREATE_MUTATION } from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInfo from '$lib/components/pages/settings/shipping-zones/general-info.svelte';
	import ShippingMethods from '$lib/components/pages/settings/shipping-zones/shipping-methods.svelte';
	import SubSection from '$lib/components/pages/settings/shipping-zones/sub-section.svelte';
	import type {
		Mutation,
		MutationShippingZoneCreateArgs,
		ShippingZoneCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';

	let shippingZoneInput = $state<ShippingZoneCreateInput>({
		name: '',
		addWarehouses: [],
		addChannels: [],
		description: '',
		default: false,
		countries: [],
	});
	let loading = $state(false);
	let generalFormOk = $state(false);
	let createdShippingZoneId = $state('');
	let performUpdateMetadata = $state(false);

	const handleCreate = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'shippingZoneCreate'>,
			MutationShippingZoneCreateArgs
		>(SHIPPING_ZONE_CREATE_MUTATION, {
			input: shippingZoneInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'shippingZoneCreate')) return;

		createdShippingZoneId = result.data?.shippingZoneCreate?.shippingZone?.id!;
		performUpdateMetadata = true;
	};

	const onDoneUpdateMetadata = async () => {
		toast.success($tranFunc('common.createSuccess'));
		await goto(AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_DETAILS(createdShippingZoneId));
	};
</script>

<div class="flex gap-2">
	<div class="w-6/10 space-y-2">
		<GeneralInfo
			bind:name={shippingZoneInput.name!}
			bind:description={shippingZoneInput.description!}
			disabled={loading}
			bind:countries={shippingZoneInput.countries!}
			bind:isDefault={shippingZoneInput.default!}
			bind:formOk={generalFormOk}
		/>
		<ShippingMethods disabled={loading} />
		<GeneralMetadataEditor
			objectId={createdShippingZoneId}
			bind:performUpdateMetadata
			disabled={loading}
			onDoneUpdate={onDoneUpdateMetadata}
		/>
	</div>

	<SubSection
		bind:addWarehouses={shippingZoneInput.addWarehouses!}
		bind:addChannels={shippingZoneInput.addChannels!}
		disabled={loading}
	/>
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES()}
	disabled={loading}
	disableCreateButton={!generalFormOk || loading}
	onAddClick={handleCreate}
/>
