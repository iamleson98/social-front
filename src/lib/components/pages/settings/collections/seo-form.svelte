<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { z, object, string } from 'zod';
	import type { SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';

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

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const DESCRIPTION_MAX_LENGTH = 300;

	const seoSchema = object({
		slug: string().nonempty(REQUIRED_ERROR),
		title: string().nonempty(REQUIRED_ERROR),
		description: string()
			.nonempty(REQUIRED_ERROR)
			.max(
				DESCRIPTION_MAX_LENGTH,
				$tranFunc('error.lengthInvalid', { min: 1, max: DESCRIPTION_MAX_LENGTH }),
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

<Accordion
	header="Search engine preview"
	class="bg-white rounded-lg border w-full border-gray-200 p-3"
>
	<div class="flex flex-col gap-1">
		<Input
			label="Slug"
			bind:value={slug}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			{disabled}
			variant={seoFormErrors.slug?.length ? 'error' : 'info'}
			subText={seoFormErrors.slug?.length ? seoFormErrors.slug[0] : undefined}
		/>
		<Input
			label="SEO Title"
			bind:value={seo.title}
			placeholder="SEO Title"
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			{disabled}
			variant={seoFormErrors.title?.length ? 'error' : 'info'}
			subText={seoFormErrors.title?.length ? seoFormErrors.title[0] : undefined}
		/>
		<TextArea
			bind:value={seo.description}
			placeholder="SEO Description"
			label="SEO Description"
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
</Accordion>
