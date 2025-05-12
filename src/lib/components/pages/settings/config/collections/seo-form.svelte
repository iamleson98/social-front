<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Input } from '$lib/components/ui/Input';
	import { z, object, string } from 'zod';
	import type { SeoInput } from '$lib/gql/graphql';
	import slugify from 'slugify';

	type Props = {
		name: string;
		slug?: string;
		seo: SeoInput;
	};

	let { name, slug = $bindable(), seo = $bindable() }: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const seoSchema = object({
		slug: string().nonempty(REQUIRED_ERROR),
		title: string().nonempty(REQUIRED_ERROR),
		description: string().nonempty(REQUIRED_ERROR)
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
		if (name) {
			slug = slugify(name, { lower: true, strict: true });
		}
	});
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 py-3">
	<h2 class="text-lg font-semibold px-3">Search engine preview</h2>
	<Accordion header="Search engine preview" open={false}>
		<Input
			label="Slug"
			bind:value={slug}
			required
			class="mb-2"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={seoFormErrors.slug?.length ? 'error' : 'info'}
			subText={seoFormErrors.slug?.length ? seoFormErrors.slug[0] : undefined}
		/>
		<Input
			label="Title"
			bind:value={seo.title}
			placeholder="Search Engine Title"
			class="mb-2"
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={seoFormErrors.title?.length ? 'error' : 'info'}
			subText={seoFormErrors.title?.length ? seoFormErrors.title[0] : undefined}
		/>
		<Input
			label="Description"
			bind:value={seo.description}
			placeholder="Search Engine Description"
			class="mb-2"
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={seoFormErrors.description?.length ? 'error' : 'info'}
			subText={seoFormErrors.description?.length ? seoFormErrors.description[0] : undefined}
		/>
	</Accordion>
</div>