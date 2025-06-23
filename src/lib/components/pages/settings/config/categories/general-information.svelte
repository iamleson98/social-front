<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { OutputData } from '@editorjs/editorjs';
	import type { MediaObject } from '$lib/utils/types';
	import { tranFunc } from '$i18n';
	import { object, string, z } from 'zod';
	import slugify from 'slugify';

	type Props = {
		// category: Category;
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
		loading,
		description = $bindable(),
		slug = $bindable(),
		seoTitle = $bindable(),
		seoDescription = $bindable(),
		media = $bindable<MediaObject[]>(),
		ok = $bindable(),
		isCreatePage = false,
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	let descriptionError = $derived.by(() => {
		if (!description?.blocks?.length) return REQUIRED_ERROR;
		return undefined;
	});
	let categoryFormErrors = $state.raw<Partial<Record<keyof CategorySchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(categoryFormErrors).length && !descriptionError;
	});

	$effect(() => {
		if (name && isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
			seoTitle = name;
		}
	});

	const categorySchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		seoTitle: string().nonempty(REQUIRED_ERROR),
		seoDescription: string().nonempty(REQUIRED_ERROR),
	});
	type CategorySchema = z.infer<typeof categorySchema>;

	const validate = () => {
		const result = categorySchema.safeParse({
			name,
			slug,
			seoTitle,
			seoDescription,
		});

		categoryFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};
</script>

<div class="bg-white border border-gray-200 p-3 rounded-lg space-y-3">
	<SectionHeader>General information</SectionHeader>

	<Input
		placeholder="Category name"
		disabled={loading}
		bind:value={name}
		label="Category name"
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.name?.length ? 'error' : 'info'}
		subText={categoryFormErrors.name?.[0]}
	/>

	<EditorJSComponent
		label="Category description"
		required
		placeholder="Category description"
		bind:value={description}
		variant={descriptionError ? 'error' : 'info'}
		subText={descriptionError}
	/>

	<FileInputContainer
		accept="image/*"
		max={1}
		label="Background image"
		required
		bind:medias={media}
	/>

	<SectionHeader>Seo Information</SectionHeader>
	<Input
		placeholder="Category slug"
		label="Category slug"
		required
		bind:value={slug}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.slug?.length ? 'error' : 'info'}
		subText={categoryFormErrors.slug?.[0]}
	/>
	<Input
		placeholder="Seo title"
		label="SEO title"
		required
		bind:value={seoTitle}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.seoTitle?.length ? 'error' : 'info'}
		subText={categoryFormErrors.seoTitle?.[0]}
	/>

	<TextArea
		required
		label="SEO description"
		placeholder="Seo description"
		bind:value={seoDescription}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={categoryFormErrors.seoDescription?.length ? 'error' : 'info'}
		subText={categoryFormErrors.seoDescription?.[0]}
		inputClass="min-h-20"
	/>
</div>
