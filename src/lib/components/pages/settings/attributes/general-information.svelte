<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum } from '$lib/gql/graphql';
	import { ValidSlugRegex } from '$lib/utils/consts';
	import slugify from 'slugify';
	import { object, string, z } from 'zod';

	type Props = {
		disabled?: boolean;
		name: string;
		slug: string;
		isCreatePage?: boolean;
		inputType: AttributeInputTypeEnum;
		valueRequired: boolean;
		formOk: boolean;
	};

	let {
		disabled,
		name = $bindable(),
		slug = $bindable(),
		isCreatePage = false,
		valueRequired = $bindable(),
		inputType = $bindable(),
		formOk = $bindable(),
	}: Props = $props();

	const RequiredErr = $tranFunc('helpText.fieldRequired');

	const AttributeSchema = object({
		name: string().nonempty(RequiredErr),
		inputType: string().nonempty(RequiredErr),
		slug: string().nonempty(RequiredErr).regex(ValidSlugRegex, 'Please provide valid slug'),
	});

	type AttributeProps = z.infer<typeof AttributeSchema>;

	let attributeErrors = $state<Partial<Record<keyof AttributeProps, string[]>>>({});

	const validate = () => {
		const result = AttributeSchema.safeParse({ name, slug, inputType });
		attributeErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const AttributeInputTypeOptions = Object.values(AttributeInputTypeEnum).map<SelectOption>(
		(value) => ({
			value,
			label: value.toLowerCase().replace('_', ' '),
		}),
	);

	const handleNameChange = () => {
		if (isCreatePage) slug = slugify(name, { trim: true, strict: true, lower: true });
		validate();
	};

	$effect(() => {
		formOk = !Object.keys(attributeErrors).length;
	});
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>General information</SectionHeader>

	<Input
		label="Attribute name"
		placeholder="Attribute name"
		bind:value={name}
		variant={attributeErrors.name?.length ? 'error' : 'info'}
		subText={attributeErrors.name?.[0]}
		inputDebounceOption={{ onInput: handleNameChange }}
		onblur={handleNameChange}
		required
	/>
	<Input
		label="Attribute slug"
		placeholder="Attribute slug"
		bind:value={slug}
		variant={attributeErrors.slug?.length ? 'error' : 'info'}
		subText={attributeErrors.slug?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		required
	/>

	<Select
		options={AttributeInputTypeOptions}
		label="Input type"
		placeholder="Input type"
		bind:value={inputType}
		disabled={disabled || !isCreatePage}
		required
		onchange={validate}
		variant={attributeErrors.inputType?.length ? 'error' : 'info'}
		subText={attributeErrors.inputType?.[0]}
	/>

	<Checkbox
		label="Value required"
		bind:checked={valueRequired}
		subText="If checked, this attribute is required"
		required
	/>
</div>
