<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { OutputData } from '@editorjs/editorjs';
	import type { MediaObject } from '$lib/utils/types';
	import { tranFunc } from '$i18n';
	import { any, array, object, string, z } from 'zod';
	import slugify from 'slugify';

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

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const MAX_ERROR = $tranFunc('error.itemsExceed', { max: 1 });
	const SEO_DESCRIPTION_MAX = 300;
	let categoryFormErrors = $state.raw<Partial<Record<keyof CategorySchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(categoryFormErrors).length;
	});

	$effect(() => {
		if (isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
			seoTitle = name;
		}
	});

	const categorySchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		seoTitle: string().nonempty(REQUIRED_ERROR),
		seoDescription: string()
			.nonempty(REQUIRED_ERROR)
			.max(
				SEO_DESCRIPTION_MAX,
				$tranFunc('error.lengthInvalid', { max: SEO_DESCRIPTION_MAX, min: 1 }),
			),
		media: array(any()).max(1, MAX_ERROR).nonempty(REQUIRED_ERROR),
		description: object({
			blocks: array(any()).nonempty(REQUIRED_ERROR),
		}),
	});
	type CategorySchema = z.infer<typeof categorySchema>;

	const validate = () => {
		const result = categorySchema.safeParse({
			name,
			slug,
			seoTitle,
			seoDescription,
			media,
			description,
		});

		categoryFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};
</script>

<div class="bg-white border border-gray-200 p-3 rounded-lg space-y-2">
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>

	<Input
		placeholder={$tranFunc('common.name')}
		disabled={loading}
		bind:value={name}
		label={$tranFunc('common.name')}
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.name?.length ? 'error' : 'info'}
		subText={categoryFormErrors.name?.[0]}
	/>

	<EditorJSComponent
		label={$tranFunc('settings.description')}
		required
		placeholder={$tranFunc('settings.description')}
		bind:value={description}
		onchange={validate}
		variant={categoryFormErrors.description?.length ? 'error' : 'info'}
		subText={categoryFormErrors.description?.[0]}
		disabled={loading}
	/>

	<FileInputContainer
		accept="image/*"
		max={1}
		label={$tranFunc('common.pic')}
		required
		bind:medias={media}
		onchange={validate}
		disabled={loading}
		variant={categoryFormErrors.media?.length ? 'error' : 'info'}
		subText={categoryFormErrors.media?.[0]}
	/>

	<SectionHeader>{$tranFunc('common.seoInfo')}</SectionHeader>
	<Input
		placeholder="Slug"
		label="Slug"
		required
		bind:value={slug}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.slug?.length ? 'error' : 'info'}
		subText={categoryFormErrors.slug?.[0]}
		disabled={loading}
	/>
	<Input
		placeholder={$tranFunc('settings.title')}
		label={$tranFunc('settings.title')}
		required
		bind:value={seoTitle}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.seoTitle?.length ? 'error' : 'info'}
		subText={categoryFormErrors.seoTitle?.[0]}
		disabled={loading}
	/>

	<TextArea
		required
		label={$tranFunc('settings.description')}
		placeholder={$tranFunc('settings.description')}
		bind:value={seoDescription}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.seoDescription?.length ? 'error' : 'info'}
		subText={categoryFormErrors.seoDescription?.[0] ??
			`${seoDescription?.length} / ${SEO_DESCRIPTION_MAX}`}
		inputClass="min-h-20"
		disabled={loading}
	/>
</div>
