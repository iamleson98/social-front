<script lang="ts">
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInformation from '$lib/components/pages/settings/promotions/general-information.svelte';
	import Rules from '$lib/components/pages/settings/promotions/rules.svelte';
	import { PromotionTypeEnum, type PromotionCreateInput } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let promotionInput = $state<PromotionCreateInput>({
		name: '',
		type: PromotionTypeEnum.Catalogue,
		description: { blocks: [] },
		startDate: '',
		endDate: '',
	});
	let loading = $state(false);
	let generalOk = $state(true);

	let createdPromotionId = $state<string>('');

	const handleCreate = async () => {};
</script>

<div class="space-y-2">
	<GeneralInformation
		bind:name={promotionInput.name!}
		bind:type={promotionInput.type}
		bind:description={promotionInput.description}
		bind:startDate={promotionInput.startDate}
		bind:endDate={promotionInput.endDate}
		disabled={loading}
		isCreatePage
		bind:ok={generalOk}
	/>

	<Rules rules={[]} />
	<GeneralMetadataEditor
		objectId={createdPromotionId}
		disabled={loading}
		metadata={[]}
		privateMetadata={[]}
	/>

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
		onAddClick={handleCreate}
		disabled={loading}
	/>
</div>
