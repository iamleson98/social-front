<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input } from '$lib/components/ui/Input';

	type Props = {
		applyOncePerCustomer: boolean;
		onlyForStaff: boolean;
		singleUse: boolean;
		usageLimit?: number;
		disabled?: boolean;
		voucherUsedTimes: number;
	};

	let {
		applyOncePerCustomer = $bindable(),
		onlyForStaff = $bindable(),
		singleUse = $bindable(),
		usageLimit = $bindable(),
		voucherUsedTimes,
		disabled,
	}: Props = $props();

	let limitNumberOfTimesUsed = $state(typeof usageLimit === 'number');

	$effect(() => {
		if (!limitNumberOfTimesUsed) usageLimit = undefined;
	});
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>{$tranFunc('voucher.useLimit')}</SectionHeader>
	<div class="space-y-2.5">
		<Checkbox
			label={$tranFunc('voucher.limitUseTimes')}
			{disabled}
			bind:checked={limitNumberOfTimesUsed}
		/>
		{#if limitNumberOfTimesUsed}
			<div class="flex items-center gap-2">
				<Input
					bind:value={usageLimit}
					placeholder={$tranFunc('voucher.numOfUsesLimit')}
					type="number"
					min={voucherUsedTimes}
					{disabled}
				/>
				<Badge
					color="green"
					text={typeof usageLimit === 'number' && usageLimit > voucherUsedTimes
						? $tranFunc('voucher.usesLeft', { num: usageLimit - voucherUsedTimes })
						: $tranFunc('voucher.usesLeft', { num: 0 })}
				/>
			</div>
		{/if}

		<Checkbox
			label={$tranFunc('voucher.limitOneUsePerUser')}
			{disabled}
			bind:checked={applyOncePerCustomer}
		/>
		<Checkbox label={$tranFunc('voucher.limitToStaff')} {disabled} bind:checked={onlyForStaff} />
		<Checkbox
			label={$tranFunc('voucher.limitVoucherCodeUseOnce')}
			{disabled}
			bind:checked={singleUse}
		/>
	</div>
</div>
