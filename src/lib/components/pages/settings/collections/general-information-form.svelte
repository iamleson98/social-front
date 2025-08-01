<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input } from '$lib/components/ui/Input';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { any, array, object, string, z } from 'zod';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import type { MediaObject } from '$lib/utils/types';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';

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

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const MAX_ERROR = $tranFunc('error.itemsExceed', { max: 1 });

	let collectionFormErrors = $state.raw<Partial<Record<keyof CollectionSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(collectionFormErrors).length;
	});

	const collectionSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		description: object({
			blocks: array(any()).nonempty(REQUIRED_ERROR),
		}),
		media: array(any()).max(1, MAX_ERROR).nonempty(REQUIRED_ERROR),
	});
	type CollectionSchema = z.infer<typeof collectionSchema>;

	const validate = () => {
		const result = collectionSchema.safeParse({
			name,
			description,
			media,
		});

		collectionFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
	<Input
		label={$tranFunc('common.name')}
		bind:value={name}
		placeholder={$tranFunc('common.name')}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={collectionFormErrors.name?.length ? 'error' : 'info'}
		subText={collectionFormErrors.name?.[0]}
		{disabled}
		required
	/>
	<EditorJSComponent
		label={$tranFunc('settings.description')}
		placeholder={$tranFunc('settings.description')}
		bind:value={description}
		onchange={validate}
		variant={collectionFormErrors.description?.length ? 'error' : 'info'}
		subText={collectionFormErrors.description?.[0]}
		{disabled}
		required
	/>
	<FileInputContainer
		accept="image/*"
		max={1}
		bind:medias={media}
		onchange={validate}
		label={$tranFunc('common.pic')}
		variant={collectionFormErrors.media?.length ? 'error' : 'info'}
		subText={collectionFormErrors.media?.[0]}
		{disabled}
		required
	/>
</div>
