<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Button } from '$lib/components/ui';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton } from '$lib/components/ui/select';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import {
		calculateStockInputForChannels,
		type ChannelSelectOptionProps,
		type QuickFillingProps,
	} from './utils';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		channelSelectOptions: ChannelSelectOptionProps[];
		disabled?: boolean;
		handleQuickFillingClick: () => void;
		quickFillingValues: QuickFillingProps;
	};

	let {
		channelSelectOptions,
		disabled,
		handleQuickFillingClick,
		quickFillingValues = $bindable(),
	}: Props = $props();

	const DAYJS_NOW = dayjs();
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;

	/** check if quick filling form has any error */
	const quickFillingError = $derived.by(() => {
		if (quickFillingValues.stocks.some((stock) => stock.quantity % 1 !== 0)) return true;

		const {
			preOrder: { globalThreshold, endDate },
			quantityLimitPerCustomer,
		} = quickFillingValues;
		if (typeof globalThreshold === 'number' && globalThreshold % 1 !== 0) return true;
		if (typeof quantityLimitPerCustomer === 'number' && quantityLimitPerCustomer % 1 !== 0)
			return true;

		if (endDate) {
			try {
				new Date(endDate);
			} catch {
				return true;
			}
		}

		return false;
	});

	onMount(() => {
		calculateStockInputForChannels().then((value) => (quickFillingValues.stocks = value));
	});
</script>

<div class={SitenameCommonClassName}>
	<Label label={$tranFunc('product.quickFilling')} size="sm" />
	<div class="flex gap-x-2 items-start flex-row w-full">
		<div class="w-11/12 flex gap-1 items-start flex-row">
			<!-- CHANNELS -->
			<div class="w-1/6">
				<Label label={$tranFunc('product.channel')} size="sm" />
				{#if !channelSelectOptions?.length}
					<SelectSkeleton size="sm" />
				{:else}
					<Select
						size="sm"
						options={channelSelectOptions}
						value={quickFillingValues.channels.map((item) => item.channelId)}
						class="w-full"
						{disabled}
						multiple
						onchange={(opts) => {
							quickFillingValues.channels = opts as ChannelSelectOptionProps[];
						}}
					/>
				{/if}
			</div>
			<!-- PRICING -->
			<div class="w-2/6">
				{#if quickFillingValues.channels.length}
					<div class="grid grid-cols-2">
						<Label label={$tranFunc('product.price')} size="sm" />
						<Label label={$tranFunc('product.costPrice')} size="sm" />
					</div>
					<div class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-1 rounded-lg">
						{#each quickFillingValues.channels as channel, idx (idx)}
							{#snippet action()}
								<span class="font-semibold text-[9px]">{channel.currency}</span>
							{/snippet}
							<div class="flex gap-1 mt-1">
								<Input
									type="number"
									{disabled}
									min={0}
									placeholder={channel.currency}
									size="xs"
									class="w-1/2"
									bind:value={channel.price}
									variant={channel.price < 0 ? 'error' : 'info'}
									subText={channel.price < 0 ? $CommonState.NonNegativeError : ''}
									{action}
								/>
								<Input
									type="number"
									min={0}
									placeholder={channel.currency}
									{disabled}
									size="xs"
									class="w-1/2"
									bind:value={channel.costPrice}
									variant={channel.costPrice < 0 ? 'error' : 'info'}
									subText={channel.costPrice < 0 ? $CommonState.NonNegativeError : ''}
									{action}
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<!-- WEIGHT -->
			<div class="w-1/6">
				<Input
					size="sm"
					type="number"
					bind:value={quickFillingValues.weight}
					min={0}
					{disabled}
					label={$tranFunc('attributes.Weight')}
					variant={typeof quickFillingValues.weight === 'number' && quickFillingValues.weight < 0
						? 'error'
						: 'info'}
					subText={typeof quickFillingValues.weight === 'number' && quickFillingValues.weight < 0
						? $CommonState.NonNegativeError
						: undefined}
				>
					{#snippet action()}
						<span class="text-[8px] font-semibold">kg</span>
					{/snippet}
				</Input>
			</div>
			<!-- PRE-ORDER -->
			<div class="w-1/6">
				<Label label={$tranFunc('common.preorder')} size="sm" />
				<div class="border border-gray-200 bg-white p-1 rounded-lg">
					<!-- QUANTITY LIMIT -->
					<Input
						type="number"
						label={$tranFunc('product.qtyLimit')}
						min={0}
						size="xs"
						{disabled}
						class="mb-2"
						bind:value={quickFillingValues.preOrder.globalThreshold}
						variant={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
						quickFillingValues.preOrder.globalThreshold % 1 !== 0
							? 'error'
							: 'info'}
						subText={typeof quickFillingValues.preOrder.globalThreshold === 'number' &&
						quickFillingValues.preOrder.globalThreshold % 1 !== 0
							? $CommonState.NonNegativeError
							: undefined}
					/>
					<!-- AVAILABLE DATE -->
					<EaseDatePicker
						size="xs"
						{disabled}
						onchange={(date) => (quickFillingValues.preOrder.endDate = date.date)}
						value={quickFillingValues.preOrder.endDate}
						label={$tranFunc('product.preOrderEndDate')}
						allowSelectMonthYears={{
							showMonths: true,
							showYears: { min: 2020, max: DAYJS_NOW.year() + 1 },
						}}
						timeConfig={false}
						timeLock={{
							minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
							maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate(),
						}}
					/>
				</div>
			</div>
			<!-- STOCK -->
			<div class="w-1/6">
				<Label label={$tranFunc('product.stock')} size="sm" />
				{#if !quickFillingValues.stocks.length}
					<SelectSkeleton size="xs" />
				{:else}
					<div
						class="max-h-32 overflow-y-auto border border-gray-200 bg-white p-1 rounded-lg space-y-1.5"
					>
						{#each quickFillingValues.stocks as stockInput, idx (idx)}
							{@const isError = stockInput.quantity % 1 !== 0}
							<Input
								type="number"
								placeholder="quantity"
								label={stockInput.warehouseName}
								min={0}
								{disabled}
								size="xs"
								bind:value={stockInput.quantity}
								variant={isError ? 'error' : 'info'}
								subText={isError ? $CommonState.NonNegativeError : ''}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
		<!-- APPLY BUTTON -->
		<div class="w-1/12">
			<Label label={$tranFunc('common.action')} size="sm" />
			<Button
				class="btn btn-sm grow shrink"
				size="sm"
				disabled={quickFillingError || disabled}
				fullWidth
				onclick={handleQuickFillingClick}
				>{$tranFunc('btn.apply')}
			</Button>
		</div>
	</div>

	<!-- QUICK FILLING ADVANCED OPTIONS -->
	<div class="mt-2 flex gap-2 items-start" transition:slide>
		<Checkbox
			bind:checked={quickFillingValues.trackInventory}
			label={$tranFunc('product.trackInventory')}
			size="sm"
			{disabled}
		/>
		<Input
			type="number"
			bind:value={quickFillingValues.quantityLimitPerCustomer}
			size="sm"
			{disabled}
			min="0"
			label={$tranFunc('product.qtyLimit')}
			placeholder={$tranFunc('placeholders.valuePlaceholder')}
			variant={typeof quickFillingValues.quantityLimitPerCustomer === 'number' &&
			quickFillingValues.quantityLimitPerCustomer % 1 !== 0
				? 'error'
				: 'info'}
			subText={typeof quickFillingValues.quantityLimitPerCustomer === 'number' &&
			quickFillingValues.quantityLimitPerCustomer % 1 !== 0
				? $CommonState.NonNegativeError
				: ''}
		/>
	</div>
</div>
