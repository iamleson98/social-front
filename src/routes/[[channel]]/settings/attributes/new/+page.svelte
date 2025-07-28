<script lang="ts">
	import DetailSidebar from '$lib/components/pages/settings/attributes/detail-sidebar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/attributes/general-information.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import {
		AttributeInputTypeEnum,
		AttributeTypeEnum,
		type AttributeCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let attributeInput = $state<AttributeCreateInput>({
		name: '',
		type: AttributeTypeEnum.ProductType,
		slug: '',
		valueRequired: false,
		inputType: AttributeInputTypeEnum.PlainText,
		visibleInStorefront: true,
	});

	let createdAttributeId = $state('');
	let generalFormOk = $state(false);

	const handleAddAttribute = async () => {};
</script>

<div class="flex gap-2">
	<div class="space-y-2 w-7/10">
		<GeneralInformation
			bind:name={attributeInput.name}
			bind:slug={attributeInput.slug!}
			bind:valueRequired={attributeInput.valueRequired!}
			bind:inputType={attributeInput.inputType!}
			isCreatePage
			bind:formOk={generalFormOk}
		/>

		<GeneralMetadataEditor metadata={[]} privateMetadata={[]} objectId={createdAttributeId} />
	</div>

	<div class="w-3/10 space-y-2">
		<DetailSidebar
			bind:visibleInStorefront={attributeInput.visibleInStorefront!}
			isCreatePage
			bind:type={attributeInput.type}
		/>
	</div>
</div>

<ActionBar onAddClick={handleAddAttribute} backButtonUrl={AppRoute.SETTINGS_CONFIGS_ATTRIBUTES()} />
