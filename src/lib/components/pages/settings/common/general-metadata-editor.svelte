<script lang="ts">
	import {
		METADATA_DELETE_MUTATION,
		METADATA_UPDATE_MUTATION,
		PRIVATE_METADATA_UPDATE_MUTATION,
	} from '$lib/api/admin/metadata';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import type {
		MetadataInput,
		Mutation,
		MutationDeleteMetadataArgs,
		MutationUpdateMetadataArgs,
		MutationUpdatePrivateMetadataArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import MetadataEditor from './metadata-editor.svelte';

	type Props = {
		metadata: MetadataInput[];
		privateMetadata: MetadataInput[];
		disabled?: boolean;
		/**id of the object that owns those metadatas */
		objectId: string;
		/***/
		performUpdates?: boolean;
	};

	let {
		metadata,
		privateMetadata,
		disabled,
		objectId,
		performUpdates = $bindable(false),
	}: Props = $props();

	let metadataItemsToAdd = $state<MetadataInput[]>([]);
	let metadataKeysToRemove = $state<string[]>([]);
	let privateMetadataItemsToAdd = $state<MetadataInput[]>([]);
	let privateMetadataKeysToRemove = $state<string[]>([]);
	let loading = $derived(disabled || performUpdates);

	const handleUpdate = async () => {
		const tasks: Promise<any>[] = [];
		const taskKeys: (keyof Mutation)[] = [];

		if (metadataItemsToAdd.length) {
			const task = GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'updateMetadata'>,
				MutationUpdateMetadataArgs
			>(METADATA_UPDATE_MUTATION, {
				id: objectId,
				input: metadataItemsToAdd,
			}).toPromise();

			tasks.push(task);
			taskKeys.push('updateMetadata');
		}
		if (privateMetadataItemsToAdd.length) {
			const task = GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'updatePrivateMetadata'>,
				MutationUpdatePrivateMetadataArgs
			>(PRIVATE_METADATA_UPDATE_MUTATION, {
				id: objectId,
				input: privateMetadataItemsToAdd,
			}).toPromise();

			tasks.push(task);
			taskKeys.push('updatePrivateMetadata');
		}
		if (metadataKeysToRemove.length) {
			const task = GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'deleteMetadata'>,
				MutationDeleteMetadataArgs
			>(METADATA_DELETE_MUTATION, {
				id: objectId,
				keys: metadataKeysToRemove,
			}).toPromise();

			tasks.push(task);
			taskKeys.push('deleteMetadata');
		}
		if (privateMetadataKeysToRemove.length) {
			const task = GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'deletePrivateMetadata'>,
				MutationDeleteMetadataArgs
			>(METADATA_DELETE_MUTATION, {
				id: objectId,
				keys: privateMetadataKeysToRemove,
			}).toPromise();

			tasks.push(task);
			taskKeys.push('deletePrivateMetadata');
		}

		if (tasks.length) {
			const results = await Promise.all(tasks);
			results.forEach((result, idx) => checkIfGraphqlResultHasError(result, taskKeys[idx]));
		}
	};

	$effect(() => {
		if (performUpdates) {
			handleUpdate().finally(() => (performUpdates = false));
		}
	});
</script>

<div class="rounded-lg p-3 border bg-white border-gray-200">
	<MetadataEditor
		title="Metadata"
		data={metadata}
		disabled={loading}
		bind:metadataItemsToAdd
		bind:metadataKeysToRemove
	/>

	<MetadataEditor
		title="Metadata"
		data={privateMetadata}
		disabled={loading}
		bind:metadataItemsToAdd={privateMetadataItemsToAdd}
		bind:metadataKeysToRemove={privateMetadataKeysToRemove}
		class="mt-2"
	/>
</div>
