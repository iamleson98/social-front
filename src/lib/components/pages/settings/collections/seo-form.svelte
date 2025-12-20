<script lang="ts">
	import { T } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import type { SeoInput } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import slugify from 'slugify';
	import { object, string } from 'zod';

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
		slug: string().nonempty($CommonState.FieldRequiredError),
		title: string().nonempty($CommonState.FieldRequiredError),
		description: string()
			.nonempty($CommonState.FieldRequiredError)
			.max(
				DESCRIPTION_MAX_LENGTH,
				$T('error.lengthInvalid', {
					min: 1,
					max: DESCRIPTION_MAX_LENGTH,
					name: $T('settings.description'),
				}),
			),
	});
	const SchemaHandler = createSchemaHandler(
		seoSchema,
		() => ({
			slug,
			title: seo.title,
			description: seo.description,
		}),
		(success) => (ok = success),
	);

	$effect(() => {
		if (isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
			seo.title = name;
		}
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('common.seoInfo')}</SectionHeader>
	<Input
		label="Slug"
		placeholder="Slug"
		bind:value={slug}
		required
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		{disabled}
		variant={$SchemaHandler.slug?.length ? 'error' : 'info'}
		subText={$SchemaHandler.slug?.[0]}
	/>
	<Input
		label={$T('settings.name')}
		bind:value={seo.title}
		placeholder={$T('settings.name')}
		required
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		{disabled}
		variant={$SchemaHandler.title?.length ? 'error' : 'info'}
		subText={$SchemaHandler.title?.[0]}
	/>
	<TextArea
		bind:value={seo.description}
		placeholder={$T('settings.description')}
		label={$T('settings.description')}
		required
		{disabled}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0] ??
			`${seo?.description?.length || 0} / ${DESCRIPTION_MAX_LENGTH}`}
	/>
</div>
