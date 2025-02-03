<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RequiredAt } from '$lib/components/ui';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { ProductCreateInput, SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';

	type Props = {
		seoTitle: SeoInput['title'];
		seoDescription: SeoInput['description'];
		/** reference for creating default seo */
		productName: ProductCreateInput['name'];
		slug: ProductCreateInput['slug'];
	};

	const SEO_DESCRIPTION_MAX_LENGTH = 300;

	let {
		productName,
		slug = $bindable(slugify(productName || '')),
		seoDescription = $bindable(''),
		seoTitle = $bindable('')
	}: Props = $props();

	$effect(() => {
		if (productName?.trim()) slug = slugify(productName, { lower: true, strict: true });
	});
</script>

<RequiredAt class="text-sm" label={$tranFunc('product.seo')} required />
<div class="mb-3 rounded-lg bg-gray-50 border border-gray-200 p-3">
	<!-- slug -->
	<span class="text-xs">{$tranFunc('product.prdSlug')}</span>
	<Input
		placeholder={$tranFunc('placeholders.enterPrdName')}
		size="sm"
		bind:value={slug}
		class="mb-1"
	/>

	<!-- title -->
	<span class="text-xs">{$tranFunc('product.seoTitle')}</span>
	<Input
		bind:value={seoTitle}
		placeholder={$tranFunc('product.seoTitle')}
		type="text"
		class="mb-1"
		size="sm"
	/>

	<!-- description -->
	<span class="text-xs">{$tranFunc('product.seoDescription')}</span>
	<TextArea
		bind:value={seoDescription}
		placeholder={$tranFunc('product.seoDescription')}
		type="text"
		inputClass="min-h-20"
		variant={seoDescription!.length > SEO_DESCRIPTION_MAX_LENGTH ? 'error' : 'info'}
		subText={`${seoDescription!.length} / ${SEO_DESCRIPTION_MAX_LENGTH}`}
	/>
</div>
