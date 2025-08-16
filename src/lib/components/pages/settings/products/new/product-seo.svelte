<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { ProductCreateInput, SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';
	import { object, string, z } from 'zod';
	import { PRODUCT_SLUG_MAX_LENGTH } from './utils';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { CommonState } from '$lib/utils/common.svelte';

	type Props = {
		seo?: SeoInput;
		/** reference for creating default seo */
		productName: ProductCreateInput['name'];
		slug: ProductCreateInput['slug'];
		ok: boolean;
		loading: boolean;
	};

	const SEO_DESCRIPTION_MAX_LENGTH = 300; // saleor reference
	const SEO_TITLE_MAX_LENGTH = 70;

	const seoSchema = object({
		slug: string()
			.min(1, CommonState.FieldRequiredError)
			.nonempty(CommonState.FieldRequiredError)
			.max(PRODUCT_SLUG_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.prdSlug'),
					min: 1,
					max: PRODUCT_SLUG_MAX_LENGTH,
				}),
			}),
		title: string()
			.min(1, CommonState.FieldRequiredError)
			.nonempty(CommonState.FieldRequiredError)
			.max(SEO_TITLE_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoTitle'),
					min: 1,
					max: SEO_TITLE_MAX_LENGTH,
				}),
			}),
		description: string()
			.min(1, CommonState.FieldRequiredError)
			.nonempty(CommonState.FieldRequiredError)
			.max(SEO_DESCRIPTION_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('product.seoDescription'),
					min: 1,
					max: SEO_DESCRIPTION_MAX_LENGTH,
				}),
			}),
	});

	type SeoProps = z.infer<typeof seoSchema>;

	let {
		productName,
		slug = $bindable(),
		seo = $bindable({}),
		ok = $bindable(),
		loading,
	}: Props = $props();

	let seoErrors = $state.raw<Partial<Record<keyof SeoProps, string[]>>>({});

	$effect(() => {
		if (productName) {
			slug = slugify(productName, { lower: true, strict: true });
			seo.title = productName;
		}
	});

	const handleValueChange = (): void => {
		const parseResult = seoSchema.safeParse({
			slug,
			title: seo.title || '',
			description: seo.description || '',
		});

		if (!parseResult.success) {
			seoErrors = parseResult.error.formErrors.fieldErrors;
		} else {
			seoErrors = {};
		}
		ok = !Object.values(seoErrors).some(Boolean);
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>Seo information</SectionHeader>
	<Input
		placeholder={$tranFunc('product.prdSlug')}
		size="sm"
		bind:value={slug}
		class="mb-1"
		inputDebounceOption={{ onInput: handleValueChange }}
		onblur={handleValueChange}
		variant={seoErrors?.slug?.length ? 'error' : 'info'}
		subText={seoErrors?.slug?.[0]}
		required
		label={$tranFunc('product.prdSlug')}
		disabled={loading}
	/>
	<Input
		bind:value={seo.title}
		placeholder={$tranFunc('product.seoTitle')}
		type="text"
		class="mb-1"
		size="sm"
		inputDebounceOption={{ onInput: handleValueChange }}
		onblur={handleValueChange}
		variant={seoErrors?.title?.length ? 'error' : 'info'}
		subText={seoErrors?.title?.[0]}
		label={$tranFunc('product.seoTitle')}
		required
		disabled={loading}
	/>
	<TextArea
		bind:value={seo.description}
		placeholder={$tranFunc('product.seoDescription')}
		type="text"
		inputClass="min-h-20"
		size="sm"
		onblur={handleValueChange}
		inputDebounceOption={{ onInput: handleValueChange }}
		variant={seoErrors?.description?.length ? 'error' : 'info'}
		subText={seoErrors?.description?.[0] ||
			`${seo?.description?.length || 0} / ${SEO_DESCRIPTION_MAX_LENGTH}`}
		label={$tranFunc('product.seoDescription')}
		required
		disabled={loading}
	/>
</div>
