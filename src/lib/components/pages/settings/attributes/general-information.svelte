<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { ValidSlugRegex } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
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

	const AttributeSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		inputType: string().nonempty($CommonState.FieldRequiredError),
		slug: string()
			.nonempty($CommonState.FieldRequiredError)
			.regex(ValidSlugRegex, $tranFunc('error.invalidSlug')),
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

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>

	<Input
		label={$tranFunc('common.name')}
		placeholder={$tranFunc('common.name')}
		bind:value={name}
		variant={attributeErrors.name?.length ? 'error' : 'info'}
		subText={attributeErrors.name?.[0]}
		inputDebounceOption={{ onInput: handleNameChange }}
		onblur={handleNameChange}
		required
		{disabled}
	/>
	<Input
		label={$tranFunc('common.slug')}
		placeholder={$tranFunc('common.slug')}
		bind:value={slug}
		variant={attributeErrors.slug?.length ? 'error' : 'info'}
		subText={attributeErrors.slug?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		required
		{disabled}
	/>
	<Select
		options={AttributeInputTypeOptions}
		label={$tranFunc('attributes.inputType')}
		placeholder={$tranFunc('attributes.inputType')}
		bind:value={inputType}
		disabled={disabled || !isCreatePage}
		required
		onchange={validate}
		variant={attributeErrors.inputType?.length ? 'error' : 'info'}
		subText={attributeErrors.inputType?.[0]}
	/>
	<Checkbox
		label={$tranFunc('attributes.valRequired')}
		bind:checked={valueRequired}
		subText={$tranFunc('attributes.valRequireHint')}
		required
		{disabled}
	/>
</div>
