<script lang="ts">
	import { tClient } from '$i18n';
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

<div class="mb-3">
	<div class="text-sm">{tClient('product.seo')}</div>

	<!-- slug -->
	<span class="text-[10px]">{tClient('product.prdSlug')}</span>
	<Input
		placeholder={tClient('placeholders.enterPrdName')}
		size="sm"
		bind:value={slug}
		class="mb-1"
	/>

	<!-- title -->
	<span class="text-[10px]">{tClient('product.seoTitle')}</span>
	<Input
		bind:value={seoTitle}
		placeholder={tClient('product.seoTitle')}
		type="text"
		class="mb-1"
		size="sm"
	/>

	<!-- description -->
	<span class="text-[10px]">{tClient('product.seoDescription')}</span>
	<TextArea
		bind:value={seoDescription}
		placeholder={tClient('product.seoDescription')}
		type="text"
		inputClass="min-h-20"
		variant={seoDescription!.length > SEO_DESCRIPTION_MAX_LENGTH ? 'error' : 'info'}
		subText={`${seoDescription!.length} / ${SEO_DESCRIPTION_MAX_LENGTH}`}
	/>
</div>
