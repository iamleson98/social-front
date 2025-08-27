<script lang="ts">
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import type { SocialSize } from '$lib/components/ui/common';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { TimePeriodTypeEnum } from '$lib/gql/graphql';
	import { BASIC_DATE_FORMAT } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	type Props = {
		disabled?: boolean;
		expiryDate?: string;
		size?: SocialSize;
	};

	let { disabled, expiryDate = $bindable(), size = 'md' }: Props = $props();

	type ExpiryType = 'in' | 'exact';

	const NOW = dayjs();
	const EXPIRY_TYPES: ExpiryType[] = ['exact', 'in'];
	const EXPIRY_IN_OPTIONS = Object.keys(TimePeriodTypeEnum).map<SelectOption>((item) => ({
		value: item.toLowerCase(),
		label: item.toLowerCase(),
	}));

	/* if there is existing value, it should be in `exact` option, initially */
	let expiryType = $state<ExpiryType>(expiryDate ? 'exact' : 'in');
	let expireInAmount = $state<number>(1);
	let expireInUnit = $state<dayjs.ManipulateType>('month');
	let openSetExpirationDateForm = $state(!!expiryDate);

	$effect(() => {
		if (!openSetExpirationDateForm) {
			if (expiryDate !== undefined) expiryDate = undefined;
			return;
		}
		if (expiryType === 'in' && expireInAmount && expireInUnit) {
			expiryDate = NOW.add(expireInAmount, expireInUnit).format(BASIC_DATE_FORMAT);
		}
	});

	$effect(() => {
		if (expireInAmount < 0) expireInAmount = 1;
	});
</script>

<Accordion open={openSetExpirationDateForm} fixed={disabled}>
	{#snippet header()}
		<Checkbox
			label="Set gift card expiry date"
			{disabled}
			bind:checked={openSetExpirationDateForm}
		/>
	{/snippet}

	<div class="flex items-center gap-2">
		{#each EXPIRY_TYPES as type, idx (idx)}
			<RadioButton
				class="flex-1"
				label={`Expires ${type}`}
				{size}
				value={type}
				bind:group={expiryType}
				{disabled}
			/>
		{/each}
	</div>

	<div class="mt-2">
		{#if expiryType === 'exact'}
			<EaseDatePicker
				timeLock={{ minDate: NOW.toDate() }}
				timeConfig={false}
				placeholder="Set expiry date"
				label="Exact date"
				{size}
				{disabled}
				value={{ date: expiryDate }}
				allowSelectMonthYears={{
					showMonths: true,
					showYears: { min: NOW.year(), max: NOW.year() + 10 },
				}}
				onchange={(value) =>
					value?.date && (expiryDate = dayjs(value.date).format(BASIC_DATE_FORMAT))}
			/>
		{:else}
			<div class="flex items-start gap-2">
				<Input
					{size}
					placeholder="amount"
					type="number"
					min={1}
					class="flex-2/3"
					label="Amount"
					required
					bind:value={expireInAmount}
					{disabled}
				/>
				<Select
					options={EXPIRY_IN_OPTIONS}
					placeholder="units"
					{size}
					class="flex-1/3"
					label="Unit"
					required
					bind:value={expireInUnit}
					{disabled}
				/>
			</div>
		{/if}
	</div>

	<Alert {size} bordered class="mt-2">
		<div>Will expire on:</div>
		{#if expiryDate}
			<Badge {size} text={expiryDate} />
		{/if}
	</Alert>
</Accordion>
