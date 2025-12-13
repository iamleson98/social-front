<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		METADATA_DELETE_MUTATION,
		METADATA_UPDATE_MUTATION,
		PRIVATE_METADATA_DELETE_MUTATION,
		PRIVATE_METADATA_UPDATE_MUTATION,
	} from '$lib/api/admin/metadata';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import type { MetadataInput, MetadataItem, Mutation } from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import MetadataEditor from './metadata-editor.svelte';
	import type { AnyVariables, TypedDocumentNode } from '@urql/core';
	import { noop, omit } from 'es-toolkit';

	type Props = {
		metadata?: MetadataItem[];
		privateMetadata?: MetadataItem[];
		disabled?: boolean;
		/** id of the object that owns those metadatas */
		objectId?: string;
		/** the lock for parent to trigger the updating of metadatas. MUST provided as `bind:performUpdateMetadata` */
		performUpdateMetadata?: boolean;
		/** callback when update is done */
		onDoneUpdate?: () => void;
		formOk?: boolean;

		privateMetadataKeysToHide?: string[];
		metadataKeysToHide?: string[];
	};

	let {
		metadata = $bindable([]),
		privateMetadata = $bindable([]),
		disabled,
		objectId,
		performUpdateMetadata = $bindable(false),
		onDoneUpdate = noop,
		formOk = $bindable(true),
		privateMetadataKeysToHide,
		metadataKeysToHide,
	}: Props = $props();

	let metadataItemsToAdd = $state<MetadataInput[]>([]);
	let metadataKeysToRemove = $state<string[]>([]);
	let privateMetadataItemsToAdd = $state<MetadataInput[]>([]);
	let privateMetadataKeysToRemove = $state<string[]>([]);
	let formMetaOk = $state(true);
	let formPrivateMetaOk = $state(true);

	$effect(() => {
		formOk = formMetaOk && formPrivateMetaOk;
	});

	type TaskProps = {
		query: TypedDocumentNode<any, AnyVariables>;
		variables: Record<string, unknown>;
	};

	/**
	 * NOTE: either `newObjectId` or `objectId` prop MUST be provided
	 */
	export const handleUpdate = async (newObjectId?: string) => {
		const taskKeys: (keyof Mutation)[] = [];
		const taskProps: TaskProps[] = [];
		const actualObjectId = newObjectId || objectId;

		if (!actualObjectId) {
			console.error('`newObjectId` or `objectId` prop MUST be provided');
			return;
		}

		if (metadataItemsToAdd.length) {
			taskProps.push({
				query: METADATA_UPDATE_MUTATION,
				variables: { id: actualObjectId, input: metadataItemsToAdd },
			});
			taskKeys.push('updateMetadata');
		}
		if (privateMetadataItemsToAdd.length) {
			taskProps.push({
				query: PRIVATE_METADATA_UPDATE_MUTATION,
				variables: { id: actualObjectId, input: privateMetadataItemsToAdd },
			});
			taskKeys.push('updatePrivateMetadata');
		}
		if (metadataKeysToRemove.length) {
			taskProps.push({
				query: METADATA_DELETE_MUTATION,
				variables: { id: actualObjectId, keys: metadataKeysToRemove },
			});
			taskKeys.push('deleteMetadata');
		}
		if (privateMetadataKeysToRemove.length) {
			taskProps.push({
				query: PRIVATE_METADATA_DELETE_MUTATION,
				variables: { id: actualObjectId, keys: privateMetadataKeysToRemove },
			});
			taskKeys.push('deletePrivateMetadata');
		}

		if (!taskProps.length) return false;

		const tasks = taskProps.map((props) =>
			GRAPHQL_CLIENT.mutation(props.query, props.variables).toPromise(),
		);
		const results = await Promise.all(tasks);
		return results.some((result, idx) => checkIfGraphqlResultHasError(result, taskKeys[idx]));
	};

	$effect(() => {
		if (performUpdateMetadata) {
			handleUpdate()
				.then(onDoneUpdate)
				.finally(() => {
					performUpdateMetadata = false;
				});
		}
	});
</script>

<div class={SitenameCommonClassName}>
	<MetadataEditor
		title={$tranFunc('common.metadata')}
		data={metadata.map((item) => omit(item, ['__typename']))}
		{disabled}
		keysToHide={metadataKeysToHide}
		bind:metadataItemsToAdd
		bind:metadataKeysToRemove
		bind:formOk={formMetaOk}
	/>

	<MetadataEditor
		title={$tranFunc('common.privateMetadata')}
		data={privateMetadata.map((item) => omit(item, ['__typename']))}
		{disabled}
		keysToHide={privateMetadataKeysToHide}
		bind:metadataItemsToAdd={privateMetadataItemsToAdd}
		bind:metadataKeysToRemove={privateMetadataKeysToRemove}
		bind:formOk={formPrivateMetaOk}
	/>
</div>
