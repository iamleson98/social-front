<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum } from '$lib/gql/graphql';
	import slugify from 'slugify';
	import { object, string, z } from 'zod';

	type Props = {
		disabled?: boolean;
		name: string;
		slug: string;
		isCreatePage?: boolean;
		inputType?: AttributeInputTypeEnum;
		valueRequired: boolean;
	};

	const RequiredErr = $tranFunc('helpText.fieldRequired');

	let {
		disabled,
		name = $bindable(),
		slug = $bindable(),
		isCreatePage = false,
		valueRequired = $bindable(),
		inputType = $bindable(),
	}: Props = $props();

	const AttributeSchema = object({
		name: string().nonempty(RequiredErr),
		slug: string()
			.nonempty(RequiredErr)
			.regex(/^(a-z-)+$/, 'Please provide valid slug'),
	});

	type AttributeProps = z.infer<typeof AttributeSchema>;

	let attributeErrors = $state<Partial<Record<keyof AttributeProps, string[]>>>({});

	const validate = () => {
		const result = AttributeSchema.safeParse({ name, slug });
		attributeErrors = result.success ? {} : result.error.formErrors.fieldErrors;
	};

	$effect(() => {
		if (isCreatePage) slug = slugify(name, { trim: true, strict: true, lower: true });
	});

	const AttributeInputTypeOptions = Object.values(AttributeInputTypeEnum).map<SelectOption>(
		(value) => ({
			value,
			label: value.toLowerCase().replace('_', ' '),
		}),
	);
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>General information</SectionHeader>

	<Input
		label="Attribute name"
		placeholder="Attribute name"
		bind:value={name}
		required
		variant={attributeErrors.name?.length ? 'error' : 'info'}
		subText={attributeErrors.name?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
	<Input
		label="Attribute slug"
		placeholder="Attribute slug"
		bind:value={slug}
		required
		variant={attributeErrors.slug?.length ? 'error' : 'info'}
		subText={attributeErrors.slug?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>

	<Select
		options={AttributeInputTypeOptions}
		label="Input type"
		placeholder="Input type"
		required
		bind:value={inputType}
		disabled={disabled || !isCreatePage}
	/>

	<Checkbox
		label="Value required"
		bind:checked={valueRequired}
		size="sm"
		subText="If checked, this attribute is required"
		required
	/>
</div>
