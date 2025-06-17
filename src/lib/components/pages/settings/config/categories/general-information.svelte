<script lang="ts">
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { OutputData } from '@editorjs/editorjs';

	type Props = {
		// category: Category;
		name: string;
		loading?: boolean;
		description: OutputData;
		slug: string;
		seoTitle: string;
		seoDescription: string;
	};

	let {
		name = $bindable(),
		loading,
		description = $bindable(),
		slug = $bindable(),
		seoTitle = $bindable(),
		seoDescription = $bindable(),
	}: Props = $props();
</script>

<div class="bg-white border border-gray-200 p-3 rounded-lg space-y-3">
	<SectionHeader>General information</SectionHeader>

	<Input
		placeholder="Category name"
		disabled={loading}
		bind:value={name}
		label="Category name"
		required
	/>

	<EditorJSComponent
		label="Category description"
		required
		placeholder="Category description"
		bind:value={description}
	/>

	<FileInputContainer accept="image/*" medias={[]} max={1} label="Background image" required />

	<SectionHeader>Seo Information</SectionHeader>
	<Input placeholder="Category slug" label="Category slug" required bind:value={slug} />
	<Input placeholder="Seo title" label="SEO title" required bind:value={seoTitle} />

	<TextArea
		required
		label="SEO description"
		placeholder="Seo description"
		bind:value={seoDescription}
		inputClass="min-h-20"
	/>
</div>
