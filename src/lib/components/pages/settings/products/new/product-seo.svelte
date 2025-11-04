<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { ProductCreateInput, SeoInput } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { PRODUCT_SLUG_MAX_LENGTH } from './utils';
	import slugify from 'slugify';
	import { object, string } from 'zod';

	type Props = {
		seo?: SeoInput;
		/** reference for creating default seo */
		productName: ProductCreateInput['name'];
		slug: ProductCreateInput['slug'];
		formOk: boolean;
		loading: boolean;
	};

	const SEO_DESCRIPTION_MAX_LENGTH = 300; // saleor reference
	const SEO_TITLE_MAX_LENGTH = 70;

	const seoSchema = object({
		slug: string()
			.min(1, $CommonState.FieldRequiredError)
			.nonempty($CommonState.FieldRequiredError)
			.max(PRODUCT_SLUG_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.prdSlug'),
					min: 1,
					max: PRODUCT_SLUG_MAX_LENGTH,
				}),
			}),
		title: string()
			.min(1, $CommonState.FieldRequiredError)
			.nonempty($CommonState.FieldRequiredError)
			.max(SEO_TITLE_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoTitle'),
					min: 1,
					max: SEO_TITLE_MAX_LENGTH,
				}),
			}),
		description: string()
			.min(1, $CommonState.FieldRequiredError)
			.nonempty($CommonState.FieldRequiredError)
			.max(SEO_DESCRIPTION_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoDescription'),
					min: 1,
					max: SEO_DESCRIPTION_MAX_LENGTH,
				}),
			}),
	});

	const SchemaHandler = createSchemaHandler(seoSchema, () => ({
		slug,
		title: seo.title,
		description: seo.description,
	}));

	let {
		productName,
		slug = $bindable(),
		seo = $bindable({}),
		formOk = $bindable(),
		loading,
	}: Props = $props();

	$effect(() => {
		if (productName) {
			slug = slugify(productName, { lower: true, strict: true });
			seo.title = productName;
		}
		formOk = !Object.values($SchemaHandler).some(Boolean);
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>Seo information</SectionHeader>
	<Input
		placeholder={$tranFunc('product.prdSlug')}
		bind:value={slug}
		class="mb-1"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler?.slug?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.slug?.[0]}
		required
		label={$tranFunc('product.prdSlug')}
		disabled={loading}
	/>
	<Input
		bind:value={seo.title}
		placeholder={$tranFunc('product.seoTitle')}
		type="text"
		class="mb-1"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler?.title?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.title?.[0]}
		label={$tranFunc('product.seoTitle')}
		required
		disabled={loading}
	/>
	<TextArea
		bind:value={seo.description}
		placeholder={$tranFunc('product.seoDescription')}
		type="text"
		inputClass="min-h-20"
		onblur={SchemaHandler.validate}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		variant={$SchemaHandler?.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.description?.[0] ||
			`${seo?.description?.length || 0} / ${SEO_DESCRIPTION_MAX_LENGTH}`}
		label={$tranFunc('product.seoDescription')}
		required
		disabled={loading}
	/>
</div>
