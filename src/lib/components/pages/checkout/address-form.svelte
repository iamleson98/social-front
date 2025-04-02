<script lang="ts">
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type {
		Address,
		AddressInput,
		CountryCode,
		Query,
		QueryAddressValidationRulesArgs
	} from '$lib/gql/graphql';
	import { AddressTypeEnum } from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { ADDRESS_VALIDATION_RULES_QUERY } from '$lib/api/account';
	import {
		getOrderedAddressFields,
		type AddressField,
		isRequiredField,
		typeTags,
		addressFieldValidators,
		defaultAddressFormValues,
		addressToFieldValues,
		type AddressFieldLabel
	} from '$lib/utils/address';
	import { Input, Label, RadioButton } from '$lib/components/ui/Input';
	import { camelCase, uniqBy } from 'es-toolkit';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import CountryByChannelSelect from '$lib/components/common/country-language/country-by-channel-select.svelte';
	import { tranFunc } from '$i18n';

	type Props = {
		countrySelectOptions?: SelectOption[];
		onSubmit: (address: AddressInput, type?: AddressTypeEnum) => void;
		onCancel: () => void;
		updatingCHeckoutAddresses: boolean;
		defaultValue?: Address;
		channelSlug: string;
		showSetAsDefaultAddressField?: boolean;
	};

	let {
		onSubmit,
		updatingCHeckoutAddresses,
		defaultValue,
		onCancel,
		channelSlug,
		showSetAsDefaultAddressField = false
	}: Props = $props();

	let formValues = $state(
		defaultValue ? addressToFieldValues(defaultValue) : defaultAddressFormValues()
	);
	let addressType = $state<AddressTypeEnum>();
	let requiredFields: Partial<Record<AddressField, boolean>> = {};

	/** NOTE: this code must be use by client side since it contains client translation */
	const addressFieldMessages: Record<AddressFieldLabel, string> = $derived({
		city: $tranFunc('common.city'),
		firstName: $tranFunc('common.firstName'),
		countryArea: $tranFunc('common.countryArea'),
		lastName: $tranFunc('common.lastName'),
		country: $tranFunc('common.country'),
		cityArea: $tranFunc('common.cityArea'),
		postalCode: $tranFunc('common.postalCode'),
		companyName: $tranFunc('common.companyName'),
		streetAddress1: $tranFunc('common.streetAddress1'),
		streetAddress2: $tranFunc('common.streetAddress2'),
		phone: $tranFunc('common.phone')
	});

	const ADDRESS_VALIDATION_RULES_STORE = operationStore<
		Pick<Query, 'addressValidationRules'>,
		QueryAddressValidationRulesArgs
	>({
		kind: 'query',
		query: ADDRESS_VALIDATION_RULES_QUERY,
		context: { requestPolicy: 'cache-and-network' },
		pause: true
	});

	$effect(() => {
		if (!formValues.countryCode.value) return;

		ADDRESS_VALIDATION_RULES_STORE.reexecute({
			variables: { countryCode: formValues.countryCode.value as CountryCode }
		});
	});

	const checkFieldIsRequired = (field: AddressField) => {
		if (!$ADDRESS_VALIDATION_RULES_STORE.data?.addressValidationRules) return false;

		const required = isRequiredField(
			field,
			$ADDRESS_VALIDATION_RULES_STORE.data.addressValidationRules
		);
		return (requiredFields[field] = required); //
	};

	const handleSubmit = () => {
		if (!$ADDRESS_VALIDATION_RULES_STORE.data?.addressValidationRules) {
			toastStore.send({
				variant: 'error',
				message: 'Address validation rules are not available'
			});
			return;
		}

		let isFormInvalid = false;

		for (const key of Object.keys(formValues) as AddressField[]) {
			const obj = formValues[key];
			const error = addressFieldValidators[key](
				!!requiredFields[key],
				obj.value,
				formValues.countryCode.value as CountryCode
			);
			if (error) isFormInvalid = true;
			formValues[key].error = error;
		}

		if (!isFormInvalid) {
			const addressInput: AddressInput = Object.fromEntries(
				Object.entries(formValues).map(([key, obj]) => [key, obj.value])
			);
			addressInput.country = formValues.countryCode.value as CountryCode;
			delete addressInput['countryCode' as never];
			onSubmit(addressInput, addressType);
		}
	};
</script>

<div>
	<div class="mb-2">
		<CountryByChannelSelect
			{channelSlug}
			label={$tranFunc('settings.chooseCountry')}
			bind:singleValue={formValues.countryCode.value as CountryCode}
			disabled={$ADDRESS_VALIDATION_RULES_STORE.fetching}
			size="sm"
		/>
	</div>

	{#if $ADDRESS_VALIDATION_RULES_STORE.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-6 w-full" />
		</SkeletonContainer>
	{:else if $ADDRESS_VALIDATION_RULES_STORE.error}
		<Alert variant="error" size="sm" bordered>{$ADDRESS_VALIDATION_RULES_STORE.error.message}</Alert
		>
	{:else if $ADDRESS_VALIDATION_RULES_STORE.data?.addressValidationRules}
		{@const { allowedFields, countryAreaChoices, countryAreaType, cityType, postalCodeType } =
			$ADDRESS_VALIDATION_RULES_STORE.data.addressValidationRules}
		{@const orderedAddressFields = getOrderedAddressFields(allowedFields as AddressField[])}

		{#each orderedAddressFields as field, idx (idx)}
			{@const label = addressFieldMessages[camelCase(field) as AddressFieldLabel] || field}
			{@const required = checkFieldIsRequired(field)}
			{#if field === 'countryArea'}
				{@const choiceOptions = uniqBy(countryAreaChoices, (item) => item.raw).map<SelectOption>(
					({ verbose, raw }) => ({
						value: raw as string,
						label: verbose as string
					})
				)}
				<Select
					options={choiceOptions}
					placeholder={label || 'Country Area'}
					label={label || 'Country Area'}
					size="sm"
					{required}
					bind:value={formValues[field].value}
					variant={formValues[field].error ? 'error' : 'info'}
					subText={formValues[field].error || ''}
					disabled={updatingCHeckoutAddresses}
					class="mb-2"
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
					disabled={updatingCHeckoutAddresses}
				/>
			{/if}
		{/each}

		<!-- MARK: address type -->
		{#if showSetAsDefaultAddressField}
			<Label label="Set as default address?" size="sm" />
			<div class="flex items-center gap-2">
				<RadioButton
					label={AddressTypeEnum.Billing}
					value={AddressTypeEnum.Billing}
					bind:group={addressType}
					disabled={updatingCHeckoutAddresses}
					size="sm"
				/>
				<RadioButton
					label={AddressTypeEnum.Shipping}
					value={AddressTypeEnum.Shipping}
					bind:group={addressType}
					disabled={updatingCHeckoutAddresses}
					size="sm"
				/>
			</div>
		{/if}

		<div class="text-end">
			<Button
				size="xs"
				variant="light"
				onclick={handleSubmit}
				disabled={updatingCHeckoutAddresses}
				loading={updatingCHeckoutAddresses}
			>
				{$tranFunc('settings.useThisAddr')}
			</Button>
		</div>
	{/if}
	<div class="text-end mt-2">
		<Button size="xs" onclick={onCancel} disabled={updatingCHeckoutAddresses} color="red">
			{$tranFunc('common.cancel')}
		</Button>
	</div>
</div>
