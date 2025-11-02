<script lang="ts">
	import { tranFunc } from '$i18n';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import slugify from 'slugify';
	import { any, array, object, string } from 'zod';

	type Props = {
		name: string;
		loading?: boolean;
		description: OutputData;
		slug: string;
		seoTitle: string;
		seoDescription: string;
		media: MediaObject[];
		ok?: boolean;
		isCreatePage?: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		slug = $bindable(),
		seoTitle = $bindable(),
		seoDescription = $bindable(),
		media = $bindable<MediaObject[]>(),
		ok = $bindable(),
		isCreatePage = false,
		loading,
	}: Props = $props();

	const MAX_ERROR = $tranFunc('error.itemsExceed', { max: 1 });
	const SEO_DESCRIPTION_MAX = 300;

	const categorySchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		slug: string().nonempty($CommonState.FieldRequiredError),
		seoTitle: string().nonempty($CommonState.FieldRequiredError),
		seoDescription: string()
			.nonempty($CommonState.FieldRequiredError)
			.max(
				SEO_DESCRIPTION_MAX,
				$tranFunc('error.lengthInvalid', { max: SEO_DESCRIPTION_MAX, min: 1 }),
			),
		media: array(any()).max(1, MAX_ERROR).nonempty($CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).nonempty($CommonState.FieldRequiredError),
		}),
	});
	const SchemaHandler = createSchemaHandler(categorySchema, () => ({
		name,
		slug,
		seoTitle,
		seoDescription,
		media,
		description,
	}));

	$effect(() => {
		ok = !Object.keys($SchemaHandler).length;
	});

	$effect(() => {
		if (isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
			seoTitle = name;
		}
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
	<Input
		placeholder={$tranFunc('common.name')}
		disabled={loading}
		bind:value={name}
		label={$tranFunc('common.name')}
		required
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
	/>
	<EditorJSComponent
		label={$tranFunc('settings.description')}
		required
		placeholder={$tranFunc('settings.description')}
		bind:value={description}
		onchange={SchemaHandler.validate}
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0]}
		disabled={loading}
	/>
	<FileInputContainer
		accept="image/*"
		max={1}
		label={$tranFunc('common.pic')}
		required
		bind:medias={media}
		onchange={SchemaHandler.validate}
		disabled={loading}
		variant={$SchemaHandler.media?.length ? 'error' : 'info'}
		subText={$SchemaHandler.media?.[0]}
	/>
	<SectionHeader>{$tranFunc('common.seoInfo')}</SectionHeader>
	<Input
		placeholder={$tranFunc('common.slug')}
		label={$tranFunc('common.slug')}
		required
		bind:value={slug}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.slug?.length ? 'error' : 'info'}
		subText={$SchemaHandler.slug?.[0]}
		disabled={loading}
	/>
	<Input
		placeholder={$tranFunc('settings.title')}
		label={$tranFunc('settings.title')}
		required
		bind:value={seoTitle}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.seoTitle?.length ? 'error' : 'info'}
		subText={$SchemaHandler.seoTitle?.[0]}
		disabled={loading}
	/>
	<TextArea
		required
		label={$tranFunc('settings.description')}
		placeholder={$tranFunc('settings.description')}
		bind:value={seoDescription}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.seoDescription?.length ? 'error' : 'info'}
		subText={$SchemaHandler.seoDescription?.[0] ??
			`${seoDescription?.length} / ${SEO_DESCRIPTION_MAX}`}
		inputClass="min-h-20"
		disabled={loading}
	/>
</div>
