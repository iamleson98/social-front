<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RequiredAt } from '$lib/components/ui';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { ProductCreateInput, SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';
	import ErrorMsg from './error-msg.svelte';
	import { object, string } from 'zod';
	import { PRODUCT_SLUG_MAX_LENGTH } from './utils';

	type Props = {
		seo?: SeoInput | null;
		/** reference for creating default seo */
		productName: ProductCreateInput['name'];
		slug: ProductCreateInput['slug'];
		ok: boolean;
	};

	// const fieldRequired = $tranFunc('helpText.fieldRequired');
	const SEO_DESCRIPTION_MAX_LENGTH = 300; // saleor reference
	const SEO_TITLE_MAX_LENGTH = 70;

	const seoSchema = object({
		slug: string()
			.min(1, { message: $tranFunc('helpText.fieldRequired') })
			.max(PRODUCT_SLUG_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.prdSlug'),
					min: 1,
					max: PRODUCT_SLUG_MAX_LENGTH
				})
			}),
		title: string()
			.min(1, { message: $tranFunc('helpText.fieldRequired') })
			.max(SEO_TITLE_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoTitle'),
					min: 1,
					max: SEO_TITLE_MAX_LENGTH
				})
			}),
		description: string()
			.min(1, { message: $tranFunc('helpText.fieldRequired') })
			.max(SEO_DESCRIPTION_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoDescription'),
					min: 1,
					max: SEO_DESCRIPTION_MAX_LENGTH
				})
			})
	});

	let { productName, slug = $bindable(), seo = $bindable(), ok = $bindable() }: Props = $props();

	let seoErrors = $state<Record<string, any>>({});
	let innerSeo = $state<SeoInput>({});

	$effect(() => {
		if (productName) {
			slug = slugify(productName, { lower: true, strict: true });
			innerSeo.title = productName;
		}
	});

	$effect(() => {
		seo = innerSeo;
	});

	const handleValueChange = (): void => {
		const parseResult = seoSchema.safeParse({
			slug,
			title: innerSeo.title,
			description: innerSeo.description
		});
		if (!parseResult.success) {
			seoErrors = parseResult.error.formErrors.fieldErrors;
		} else {
			seoErrors = {};
		}
		ok = !Object.values(seoErrors).some(Boolean);
	};
</script>

<div class="mb-3">
	<RequiredAt class="text-sm" label={$tranFunc('product.seo')} required />

	<div
		class="rounded-lg border p-3 {Object.values(seoErrors).some(Boolean)
			? 'bg-red-50 border-red-200'
			: 'bg-gray-50 border-gray-200'}"
	>
		<!-- slug -->
		<span class="text-xs">{$tranFunc('product.prdSlug')}</span>
		<Input
			placeholder={$tranFunc('product.prdSlug')}
			size="sm"
			bind:value={slug}
			class="mb-1"
			inputDebounceOption={{ onInput: handleValueChange }}
			onblur={handleValueChange}
			variant={seoErrors?.slug?.length ? 'error' : 'info'}
			subText={seoErrors?.slug?.length ? seoErrors.slug[0] : undefined}
		/>

		<!-- title -->
		<span class="text-xs">{$tranFunc('product.seoTitle')}</span>
		<Input
			bind:value={innerSeo.title}
			placeholder={$tranFunc('product.seoTitle')}
			type="text"
			class="mb-1"
			size="sm"
			inputDebounceOption={{ onInput: handleValueChange }}
			onblur={handleValueChange}
			variant={seoErrors?.title?.length ? 'error' : 'info'}
			subText={seoErrors?.title?.length ? seoErrors.title[0] : undefined}
		/>

		<!-- description -->
		<span class="text-xs">{$tranFunc('product.seoDescription')}</span>
		<TextArea
			bind:value={innerSeo.description}
			placeholder={$tranFunc('product.seoDescription')}
			type="text"
			inputClass="min-h-20"
			onblur={handleValueChange}
			inputDebounceOption={{ onInput: handleValueChange }}
			variant={seoErrors?.description?.length ? 'error' : 'info'}
			subText={seoErrors?.description?.length
				? seoErrors.description[0]
				: `${seo?.description?.length || 0} / ${SEO_DESCRIPTION_MAX_LENGTH}`}
		/>
	</div>

	<ErrorMsg
		error={Object.values(seoErrors).some(Boolean) ? $tranFunc('error.thereIsError') : undefined}
	/>
</div>
