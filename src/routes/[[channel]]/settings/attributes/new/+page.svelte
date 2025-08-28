<script lang="ts">
	import { goto } from '$app/navigation';
	import { ATTRIBUTE_CREATE_MUTATION } from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import AttributeValues from '$lib/components/pages/settings/attributes/attribute-values.svelte';
	import DetailSidebar from '$lib/components/pages/settings/attributes/detail-sidebar.svelte';
	import GeneralInformation from '$lib/components/pages/settings/attributes/general-information.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import {
		AttributeInputTypeEnum,
		AttributeTypeEnum,
		MeasurementUnitsEnum,
		type AttributeCreateInput,
		type Mutation,
		type MutationAttributeCreateArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { toast } from 'svelte-sonner';

	let attributeInput = $state<AttributeCreateInput>({
		name: '',
		type: AttributeTypeEnum.ProductType,
		slug: '',
		valueRequired: false,
		inputType: AttributeInputTypeEnum.PlainText,
		visibleInStorefront: true,
		unit: MeasurementUnitsEnum.G,
	});

	let generalFormOk = $state(false);
	let metaRef = $state<any>();
	let loading = $state(false);

	const handleAddAttribute = async () => {
		loading = true;

		const createResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeCreate'>,
			MutationAttributeCreateArgs
		>(ATTRIBUTE_CREATE_MUTATION, {
			input: attributeInput,
		});

		if (checkIfGraphqlResultHasError(createResult, 'attributeCreate')) {
			loading = false;
			return;
		}

		const metaHasErr = await metaRef.handleUpdate(
			createResult.data?.attributeCreate?.attribute?.id!,
		);
		loading = false;
		if (metaHasErr) return;

		toast.success(CommonState.CreateSuccess);
		await goto(
			AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(
				createResult.data?.attributeCreate?.attribute?.id!,
			),
		);
	};
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
			disabled={loading}
		/>
		<AttributeValues
			inputType={attributeInput.inputType!}
			addValues={[]}
			disabled={loading}
			removeValues={[]}
			bind:unit={attributeInput.unit!}
		/>
		<GeneralMetadataEditor disabled={loading} objectId="" bind:this={metaRef} />
	</div>

	<div class="w-3/10 space-y-2">
		<DetailSidebar
			bind:visibleInStorefront={attributeInput.visibleInStorefront!}
			isCreatePage
			bind:type={attributeInput.type}
			disabled={loading}
		/>
	</div>
</div>

<ActionBar
	onAddClick={handleAddAttribute}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_ATTRIBUTES()}
	disabled={loading}
/>
