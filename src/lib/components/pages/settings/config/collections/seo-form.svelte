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
	};

	let { name, slug = $bindable(), seo = $bindable(), isCreatePage, disabled}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const DESCRIPTION_MAX_LENGTH = 300;

	const seoSchema = object({
		slug: string().nonempty(REQUIRED_ERROR),
		title: string().nonempty(REQUIRED_ERROR),
		description: string().nonempty(REQUIRED_ERROR).max(DESCRIPTION_MAX_LENGTH, 'Description must be at most 300 characters long')
	});

	type SeoSchema = z.infer<typeof seoSchema>;

	let seoFormErrors = $state.raw<Partial<Record<keyof SeoSchema, string[]>>>({});

	const validate = () => {
		const parseResult = seoSchema.safeParse({
			slug,
			title: seo.title,
			description: seo.description
		});
		if (!parseResult.success) {
			seoFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		seoFormErrors = {};
		return true;
	};

	$effect(() => {
		if (name && isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
		}
	});
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-3">
	<h2 class="text-lg font-semibold">Search engine preview</h2>
	<Accordion header="Search engine preview" open={false}>
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
			label="Title"
			bind:value={seo.title}
			placeholder="Search Engine Title"
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			{disabled}
			variant={seoFormErrors.title?.length ? 'error' : 'info'}
			subText={seoFormErrors.title?.length ? seoFormErrors.title[0] : undefined}
		/>
		<TextArea
			bind:value={seo.description}
			placeholder="Search Engine Description"
			label="Description"
			required
			{disabled}
			inputClass="min-h-20"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={seoFormErrors.description?.length ? 'error' : 'info'}
			subText={seoFormErrors.description?.length
				? seoFormErrors.description[0]
				: `${seo?.description?.length || 0} / ${DESCRIPTION_MAX_LENGTH}`}
		/>
	</Accordion>
</div>