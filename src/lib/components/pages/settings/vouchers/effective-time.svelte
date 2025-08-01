<script lang="ts">
	import { tranFunc } from '$i18n';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		startDate: string;
		endDate: string;
		disabled?: boolean;
	};

	let { startDate = $bindable(), endDate = $bindable(), disabled }: Props = $props();
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('voucher.effectDate')}</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<EaseDatePicker
			required
			{disabled}
			label={$tranFunc('common.startAt')}
			value={{ date: startDate }}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
			placeholder={$tranFunc('common.startAt')}
			allowSelectMonthYears={{
				showMonths: true,
				showResetBtn: true,
				showYears: {
					min: 2020,
					max: 2050,
				},
			}}
		/>

		<EaseDatePicker
			{disabled}
			label={$tranFunc('common.endAt')}
			placeholder={$tranFunc('common.endAt')}
			value={{ date: endDate }}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			onchange={(value) => {
				endDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
			allowSelectMonthYears={{
				showMonths: true,
				showResetBtn: true,
				showYears: {
					min: 2020,
					max: 2050,
				},
			}}
		/>
	</div>
</div>
