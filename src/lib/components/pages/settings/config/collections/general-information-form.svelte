<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input } from '$lib/components/ui/Input';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import { object, string, z } from 'zod';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import type { MediaObject } from '$lib/utils/types';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';

	type Props = {
		name: string;
		description?: OutputData;
		disabled?: boolean;
		media: MediaObject[];
		ok?: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		media = $bindable<MediaObject[]>(),
		ok = $bindable(),
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	let descriptionError = $derived.by(() => {
		if (!description?.blocks?.length) return REQUIRED_ERROR;
		return undefined;
	});
	let collectionFormErrors = $state.raw<Partial<Record<keyof CollectionSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(collectionFormErrors).length && !descriptionError;
	});

	const collectionSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
	});
	type CollectionSchema = z.infer<typeof collectionSchema>;

	const validate = () => {
		const result = collectionSchema.safeParse({
			name,
		});

		collectionFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-2">
	<SectionHeader>General Information</SectionHeader>
	<Input
		label="Name"
		bind:value={name}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={collectionFormErrors.name?.length ? 'error' : 'info'}
		subText={collectionFormErrors.name?.[0]}
	/>
	<EditorJSComponent
		header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
		simpleImage
		list={{ defaultStyle: 'unordered', maxLevel: 3, inlineToolbar: true }}
		embed={{ services: { youtube: true } }}
		quote={{ inlineToolbar: true }}
		onchange={(data) => (description = data)}
		placeholder={$tranFunc('placeholders.valuePlaceholder')}
		bind:value={description}
		variant={descriptionError ? 'error' : 'info'}
		subText={descriptionError}
		required
		label="Collection description"
	/>

	<FileInputContainer
		accept="image/*"
		max={1}
		bind:medias={media}
		required
		label="Collection Image"
	/>
</div>
