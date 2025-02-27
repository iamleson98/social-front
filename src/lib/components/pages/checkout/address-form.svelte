<script lang="ts">
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type {
		Address,
		AddressInput,
		CountryCode,
		Query,
		QueryAddressValidationRulesArgs,
		QueryChannelArgs
	} from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { ADDRESS_VALIDATION_RULES_QUERY } from '$lib/api/account';
	import {
		getOrderedAddressFields,
		type AddressField,
		getFieldLabel,
		isRequiredField,
		typeTags,
		addressFieldValidators,
		defaultAddressFormValues,
		addressToFieldValues,
		getCountryName
	} from '$lib/utils/address';
	import { Input } from '$lib/components/ui/Input';
	import { uniqBy } from 'es-toolkit';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';

	type Props = {
		countrySelectOptions?: SelectOption[];
		onSubmit: (address: AddressInput) => void;
		onCancel: () => void;
		updatingCHeckoutAddresses: boolean;
		defaultValue?: Address;
		channelSlug: string;
	};

	let { onSubmit, updatingCHeckoutAddresses, defaultValue, onCancel, channelSlug }: Props =
		$props();

	let formValues = $state(
		defaultValue ? addressToFieldValues(defaultValue) : defaultAddressFormValues
	);
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

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug)
		}
	});

	$effect(() => {
		if (!formValues.countryCode.value) return;

		validationStore.reexecute({
			variables: { countryCode: formValues.countryCode.value as CountryCode }
		});
	});

	const checkFieldIsRequired = (field: AddressField) => {
		if (!$validationStore.data?.addressValidationRules) return false;

		const required = isRequiredField(field, $validationStore.data.addressValidationRules);
		return (requiredFields[field] = required); //
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
			onSubmit(addressInput);
		}
	};
</script>

<div>
	{#if $channelStore.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-4 w-full" />
		</SkeletonContainer>
	{:else if $channelStore.error}
		<Alert variant="error" size="sm" bordered>{$channelStore.error.message}</Alert>
	{:else if $channelStore.data?.channel}
		{@const availableCountries =
			$channelStore.data?.channel?.countries?.map<SelectOption>(({ code }) => ({
				value: code,
				label: getCountryName(code)
			})) || []}
		<Select
			disabled={$validationStore.fetching}
			bind:value={formValues.countryCode.value}
			size="sm"
			options={availableCountries}
			label="Choose your country"
		/>
	{/if}

	{#if $validationStore.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-6 w-full" />
		</SkeletonContainer>
	{:else if $validationStore.error}
		<Alert variant="error" size="sm" bordered>{$validationStore.error.message}</Alert>
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
				{@const choiceOptions = uniqBy(countryAreaChoices, (item) => item.raw).map<SelectOption>(
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
					bind:value={formValues[field].value}
					variant={formValues[field].error ? 'error' : 'info'}
					subText={formValues[field].error || ''}
					disabled={updatingCHeckoutAddresses}
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

		<div class="flex gap-2 justify-end items-center">
			<Button
				size="xs"
				variant="light"
				onclick={handleSubmit}
				disabled={updatingCHeckoutAddresses}
				loading={updatingCHeckoutAddresses}
			>
				Use this address
			</Button>
			<Button size="xs" onclick={onCancel} disabled={updatingCHeckoutAddresses} color="red">
				Cancel
			</Button>
		</div>
	{/if}
</div>
