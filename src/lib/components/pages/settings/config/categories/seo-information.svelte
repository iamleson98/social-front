<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';

	type Props = {
		slug: string;
		seoTitle: string;
		seoDescription: string;
	};

	let { slug = $bindable(), seoDescription, seoTitle }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader>Search engine preview</SectionHeader>

	<Input placeholder="Category slug" bind:value={slug} />
</div>
