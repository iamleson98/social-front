<script lang="ts">
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { CountryCode, Query, QueryAddressValidationRulesArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/stores/api/operation';
	import { ADDRESS_VALIDATION_RULES_QUERY } from '$lib/stores/api/account';
	import {
		getOrderedAddressFields,
		type AddressField,
		getFieldLabel,
		isRequiredField,
		typeTags,
		addressFieldValidators,
		defaultAddressFieldObj
	} from '$lib/utils/address';
	import { Input } from '$lib/components/ui/Input';
	import { uniqBy } from 'lodash-es';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';

	type Props = {
		countrySelectOptions: SelectOption[];
		onSubmit: (address: Partial<Record<AddressField, string | number>>) => void;
	};

	let { countrySelectOptions, onSubmit }: Props = $props();

	let selectedCountry = $state<CountryCode>();
	let formValues = $state(defaultAddressFieldObj);
	let requiredFields: Partial<Record<AddressField, boolean>> = {};

	const validationStore = operationStore<
		Pick<Query, 'addressValidationRules'>,
		QueryAddressValidationRulesArgs
	>({
		kind: 'query',
		query: ADDRESS_VALIDATION_RULES_QUERY,
		context: { requestPolicy: 'network-only' },
		pause: true
	});

	$effect(() => {
		if (!selectedCountry) return;

		validationStore.reexecute({
			variables: { countryCode: selectedCountry }
		});
	});

	const checkFieldIsRequired = (field: AddressField) => {
		if (!$validationStore.data?.addressValidationRules) return false;

		const required = isRequiredField(field, $validationStore.data.addressValidationRules);
		requiredFields[field] = required;
		return required;
	};

	const handleSubmit = () => {
		if (!$validationStore.data?.addressValidationRules) {
			toastStore.send({
				variant: 'error',
				message: 'Address validation rules are not available'
			});
			return;
		}

		let isFormInvalid = false;

		for (const key of Object.keys(formValues) as AddressField[]) {
			const obj = formValues[key];
			const error = addressFieldValidators[key](!!requiredFields[key], obj.value);
			if (error) isFormInvalid = true;
			formValues[key].error = error;
		}

		if (!isFormInvalid) {
			onSubmit(
				(Object.keys(formValues) as AddressField[]).reduce(
					(acc, key) => {
						acc[key] = formValues[key].value;
						return acc;
					},
					{} as Partial<Record<AddressField, string | number>>
				)
			);
		}
	};
</script>

<div>
	<Select
		disabled={$validationStore.fetching}
		bind:value={selectedCountry}
		size="sm"
		options={countrySelectOptions}
		class="mb-3"
		label="Choose your country"
	/>

	{#if $validationStore.fetching}
		<div>Loading...</div>
	{:else if $validationStore.error}
		<div>Error: {$validationStore.error.message}</div>
	{:else if $validationStore.data?.addressValidationRules}
		{@const { allowedFields, countryAreaChoices, countryAreaType, cityType, postalCodeType } =
			$validationStore.data.addressValidationRules}
		{@const orderedAddressFields = getOrderedAddressFields(allowedFields as AddressField[])}
		{@const localizedObj = {
			countryArea: countryAreaType,
			city: cityType,
			postalCode: postalCodeType
		}}

		{#each orderedAddressFields as field, idx (idx)}
			{@const label = getFieldLabel(field, localizedObj)}
			{@const required = checkFieldIsRequired(field)}
			{#if field === 'countryArea' && label}
				{@const choiceOptions = uniqBy(countryAreaChoices, 'raw').map<SelectOption>(
					({ verbose, raw }) => ({
						value: raw as string,
						label: verbose as string
					})
				)}
				<Select
					options={choiceOptions}
					placeholder={label}
					{label}
					size="sm"
					{required}
					class="mb-2"
					bind:value={formValues[field].value}
					variant={formValues[field].error ? 'error' : 'info'}
					subText={formValues[field].error || ''}
				/>
			{:else if label}
				<Input
					{required}
					size="sm"
					{label}
					type={typeTags[field] || 'text'}
					placeholder={label}
					class="mb-2"
					bind:value={formValues[field].value}
					variant={formValues[field].error ? 'error' : 'info'}
					subText={formValues[field].error || ''}
				/>
			{/if}
		{/each}

		<Button size="xs" variant="light" onclick={handleSubmit}>Use this address</Button>
	{/if}
</div>
