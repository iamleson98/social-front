<script lang="ts">
	import { tranFunc } from '$i18n';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import { any, array, object, string } from 'zod';

	type Props = {
		name: string;
		description?: OutputData;
		disabled?: boolean;
		media: MediaObject[];
		ok?: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable({ blocks: [] }),
		disabled,
		media = $bindable<MediaObject[]>(),
		ok = $bindable(),
	}: Props = $props();

	const MAX_ERROR = $tranFunc('error.itemsExceed', { max: 1 });

	const collectionSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).nonempty($CommonState.FieldRequiredError),
		}),
		media: array(any()).max(1, MAX_ERROR).nonempty($CommonState.FieldRequiredError),
	});
	const SchemaHandler = createSchemaHandler(collectionSchema, () => ({
		name,
		description,
		media,
	}));

	$effect(() => {
		ok = !Object.keys($SchemaHandler).length;
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
	<Input
		label={$tranFunc('common.name')}
		bind:value={name}
		placeholder={$tranFunc('common.name')}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
		{disabled}
		required
	/>
	<EditorJSComponent
		label={$tranFunc('settings.description')}
		placeholder={$tranFunc('settings.description')}
		bind:value={description}
		onchange={SchemaHandler.validate}
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0]}
		{disabled}
		required
	/>
	<FileInputContainer
		accept="image/*"
		max={1}
		bind:medias={media}
		onchange={SchemaHandler.validate}
		label={$tranFunc('common.pic')}
		variant={$SchemaHandler.media?.length ? 'error' : 'info'}
		subText={$SchemaHandler.media?.[0]}
		{disabled}
		required
	/>
</div>
