<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea, Toggle } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { CountryDisplay } from '$lib/gql/graphql';
	import { READ_ONLY_SHOP_STORE } from '$lib/stores/shop';
	import { object, string, z } from 'zod';

	type Props = {
		name: string;
		description: string;
		disabled?: boolean;
		countries: CountryDisplay[];
		isDefault: boolean;
		formOk: boolean;
	};

	let {
		name = $bindable(),
		description = $bindable(),
		disabled,
		countries,
		isDefault = $bindable(),
		formOk = $bindable(),
	}: Props = $props();

	const RequiredErr = $tranFunc('helpText.fieldRequired');
	const ZoneSchema = object({
		name: string().nonempty(RequiredErr),
		description: string().nonempty(RequiredErr),
	});

	type ZoneType = z.infer<typeof ZoneSchema>;

	let zoneErrors = $state<Partial<Record<keyof ZoneType, string[]>>>({});

	const validate = () => {
		const result = ZoneSchema.safeParse({ name, description });
		zoneErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	$effect(() => {
		formOk = !Object.keys(zoneErrors).length;
	});

	let countryCodes = $state(countries.map((country) => country.code));

	const CountriesOptions = $derived(
		$READ_ONLY_SHOP_STORE?.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		})) || [],
	);
</script>

<div class="bg-white border border-gray-200 p-3 space-y-2 rounded-lg">
	<SectionHeader>
		<dir>General information</dir>
	</SectionHeader>

	<Input
		required
		label="Name"
		placeholder="Name"
		bind:value={name}
		{disabled}
		variant={zoneErrors.name?.length ? 'error' : 'info'}
		subText={zoneErrors.name?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
	<TextArea
		required
		label="Description"
		placeholder="Description"
		bind:value={description}
		inputClass="min-h-20"
		variant={zoneErrors.description?.length ? 'error' : 'info'}
		subText={zoneErrors.description?.[0]}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		{disabled}
	/>
	<Toggle label="Is default" bind:checked={isDefault} {disabled} />

	<SectionHeader>
		<div>Countries ({countries.length})</div>
	</SectionHeader>

	<Select
		label="Countries"
		placeholder="Shipping zone countries"
		multiple
		required
		bind:value={countryCodes}
		options={CountriesOptions}
		{disabled}
	/>
</div>
