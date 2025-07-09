<script lang="ts">
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInformation from '$lib/components/pages/settings/warehouses/general-information.svelte';
	import { type WarehouseCreateInput } from '$lib/gql/graphql';

	let warehouseInput = $state<WarehouseCreateInput>({
		name: '',
		slug: '',
		email: '',
		address: {},
	});

	let performUpdateMetadata = $state(false);
	let createdWarehouseID = $state('');
</script>

<div class="space-y-2">
	<GeneralInformation
		bind:name={warehouseInput.name}
		bind:slug={warehouseInput.slug!}
		bind:email={warehouseInput.email!}
	/>

	<GeneralMetadataEditor
		metadata={[]}
		privateMetadata={[]}
		bind:performUpdateMetadata
		objectId={createdWarehouseID}
	/>
</div>
