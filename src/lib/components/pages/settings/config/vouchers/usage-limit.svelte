<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import type { Snippet } from 'svelte';

	type UsageProps = {
		title: string;
		onCheck: (checked: boolean) => void;
		value: boolean;
		child?: Snippet;
	};

	type Props = {
		applyOncePerCustomer: boolean;
		onlyForStaff: boolean;
		singleUse: boolean;
		usageLimit?: number;

		voucherUsedTimes: number;
	};

	let {
		applyOncePerCustomer = $bindable(),
		onlyForStaff = $bindable(),
		singleUse = $bindable(),
		usageLimit = $bindable(),
		voucherUsedTimes,
	}: Props = $props();

	let limitNumberOfTimesUsed = $state(false);

	const USAGE_PROPS: UsageProps[] = $derived([
		{
			title: 'Limit number of times this discount can be used in total',
			onCheck: (checked) => {
				limitNumberOfTimesUsed = checked;
				if (!checked) usageLimit = undefined; // don't update usageLimit when limitNumberOfTimesUsed is unchecked
			},
			value: limitNumberOfTimesUsed,
			child: numOfUsesLimit,
		},
		{
			title: 'Limit to one use per customer',
			onCheck: (checked) => (applyOncePerCustomer = checked),
			value: applyOncePerCustomer,
		},
		{
			title: 'Limit to staff only',
			onCheck: (checked) => (onlyForStaff = checked),
			value: onlyForStaff,
		},
		{
			title: 'Limit to voucher code use once',
			onCheck: (checked) => (singleUse = checked),
			value: singleUse,
		},
	]);
</script>

{#snippet numOfUsesLimit()}
	{#if limitNumberOfTimesUsed}
		<div class="flex items-center gap-2">
			<Input
				bind:value={usageLimit}
				placeholder="Usage limit"
				type="number"
				min={voucherUsedTimes}
			/>
			<span
				>{typeof usageLimit === 'number' && usageLimit > voucherUsedTimes
					? `${usageLimit - voucherUsedTimes} uses left`
					: '0 uses left'}</span
			>
		</div>
	{/if}
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Usage limit</SectionHeader>
	<div class="space-y-2.5">
		{#each USAGE_PROPS as prop, idx (idx)}
			<Checkbox
				label={prop.title}
				checked={prop.value}
				onchange={(evt) => prop.onCheck(evt.currentTarget.checked)}
			/>
			{@render prop.child?.()}
		{/each}
	</div>
</div>
