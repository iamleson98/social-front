<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { z, object, string } from 'zod';
	import type { SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		name: string;
		slug?: string;
		seo: SeoInput;
		isCreatePage?: boolean;
		disabled?: boolean;
		ok: boolean;
	};

	let {
		name,
		slug = $bindable(),
		seo = $bindable(),
		isCreatePage = false,
		disabled,
		ok = $bindable(),
	}: Props = $props();

	const DESCRIPTION_MAX_LENGTH = 300;

	const seoSchema = object({
		slug: string().nonempty(CommonState.FieldRequiredError),
		title: string().nonempty(CommonState.FieldRequiredError),
		description: string()
			.nonempty(CommonState.FieldRequiredError)
			.max(
				DESCRIPTION_MAX_LENGTH,
				$tranFunc('error.lengthInvalid', {
					min: 1,
					max: DESCRIPTION_MAX_LENGTH,
					name: $tranFunc('settings.description'),
				}),
			),
	});

	type SeoSchema = z.infer<typeof seoSchema>;

	let seoFormErrors = $state.raw<Partial<Record<keyof SeoSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(seoFormErrors).length;
	});

	const validate = () => {
		const parseResult = seoSchema.safeParse({
			slug,
			title: seo.title,
			description: seo.description,
		});
		seoFormErrors = parseResult.success ? {} : parseResult.error.formErrors.fieldErrors;
		return parseResult.success;
	};

	$effect(() => {
		if (isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
			seo.title = name;
		}
		validate();
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.seoInfo')}</SectionHeader>
	<Input
		label="Slug"
		placeholder="Slug"
		bind:value={slug}
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		{disabled}
		variant={seoFormErrors.slug?.length ? 'error' : 'info'}
		subText={seoFormErrors.slug?.[0]}
	/>
	<Input
		label={$tranFunc('settings.name')}
		bind:value={seo.title}
		placeholder={$tranFunc('settings.name')}
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		{disabled}
		variant={seoFormErrors.title?.length ? 'error' : 'info'}
		subText={seoFormErrors.title?.[0]}
	/>
	<TextArea
		bind:value={seo.description}
		placeholder={$tranFunc('settings.description')}
		label={$tranFunc('settings.description')}
		required
		{disabled}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={seoFormErrors.description?.length ? 'error' : 'info'}
		subText={seoFormErrors.description?.[0] ??
			`${seo?.description?.length || 0} / ${DESCRIPTION_MAX_LENGTH}`}
	/>
</div>
