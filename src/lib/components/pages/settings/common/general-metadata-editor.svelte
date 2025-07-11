<script lang="ts">
	import {
		METADATA_DELETE_MUTATION,
		METADATA_UPDATE_MUTATION,
		PRIVATE_METADATA_DELETE_MUTATION,
		PRIVATE_METADATA_UPDATE_MUTATION,
	} from '$lib/api/admin/metadata';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import type { MetadataInput, MetadataItem, Mutation } from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { noop, omit } from 'es-toolkit';
	import type { AnyVariables, TypedDocumentNode } from '@urql/core';
	import MetadataEditor from './metadata-editor.svelte';
	import { tranFunc } from '$i18n';

	type Props = {
		metadata?: MetadataItem[];
		privateMetadata?: MetadataItem[];
		disabled?: boolean;
		/** id of the object that owns those metadatas */
		objectId: string;
		/** the lock for parent to trigger the updating of metadatas. MUST provided as `bind:performUpdateMetadata` */
		performUpdateMetadata?: boolean;
		/** callback when update is done */
		onDoneUpdate?: () => void;
	};

	let {
		metadata = [],
		privateMetadata = [],
		disabled,
		objectId,
		performUpdateMetadata = $bindable(false),
		onDoneUpdate = noop,
	}: Props = $props();

	let metadataItemsToAdd = $state<MetadataInput[]>([]);
	let metadataKeysToRemove = $state<string[]>([]);
	let privateMetadataItemsToAdd = $state<MetadataInput[]>([]);
	let privateMetadataKeysToRemove = $state<string[]>([]);
	let loading = $derived(disabled || performUpdateMetadata);

	type TaskProps = {
		query: TypedDocumentNode<any, AnyVariables>;
		variables: Record<string, unknown>;
	};

	const handleUpdate = async () => {
		const taskKeys: (keyof Mutation)[] = [];
		const taskProps: TaskProps[] = [];

		if (metadataItemsToAdd.length) {
			taskProps.push({
				query: METADATA_UPDATE_MUTATION,
				variables: { id: objectId, input: metadataItemsToAdd },
			});
			taskKeys.push('updateMetadata');
		}
		if (privateMetadataItemsToAdd.length) {
			taskProps.push({
				query: PRIVATE_METADATA_UPDATE_MUTATION,
				variables: { id: objectId, input: privateMetadataItemsToAdd },
			});
			taskKeys.push('updatePrivateMetadata');
		}
		if (metadataKeysToRemove.length) {
			taskProps.push({
				query: METADATA_DELETE_MUTATION,
				variables: { id: objectId, keys: metadataKeysToRemove },
			});
			taskKeys.push('deleteMetadata');
		}
		if (privateMetadataKeysToRemove.length) {
			taskProps.push({
				query: PRIVATE_METADATA_DELETE_MUTATION,
				variables: { id: objectId, keys: privateMetadataKeysToRemove },
			});
			taskKeys.push('deletePrivateMetadata');
		}

		if (!taskProps.length) return;

		const tasks = taskProps.map((props) =>
			GRAPHQL_CLIENT.mutation(props.query, props.variables).toPromise(),
		);
		const results = await Promise.all(tasks);
		results.forEach((result, idx) => checkIfGraphqlResultHasError(result, taskKeys[idx]));
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

<div class="rounded-lg p-3 border bg-white border-gray-200">
	<MetadataEditor
		title={$tranFunc('common.metadata')}
		data={metadata.map((item) => omit(item, ['__typename']))}
		disabled={loading}
		bind:metadataItemsToAdd
		bind:metadataKeysToRemove
	/>

	<MetadataEditor
		title={$tranFunc('common.privateMetadata')}
		data={privateMetadata.map((item) => omit(item, ['__typename']))}
		disabled={loading}
		bind:metadataItemsToAdd={privateMetadataItemsToAdd}
		bind:metadataKeysToRemove={privateMetadataKeysToRemove}
		class="mt-2"
	/>
</div>
