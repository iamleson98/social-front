<script lang="ts">
	import { T } from '$i18n';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { THIS_TIME_LAST_5_YEARS, THIS_TIME_NEXT_5_YEARS } from '$lib/utils/consts';
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
	<SectionHeader>{$T('voucher.effectDate')}</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<EaseDatePicker
			required
			{disabled}
			label={$T('common.startAt')}
			value={{ date: startDate }}
			timeConfig={{
				stepMinutes: 1,
				format: 24,
				stepHours: 1,
			}}
			onchange={(value) => {
				startDate = dayjs(value.date).format(RFC3339TimeFormat);
			}}
			placeholder={$T('common.startAt')}
			allowSelectMonthYears={{
				showMonths: true,
				showResetBtn: true,
				showYears: {
					min: THIS_TIME_LAST_5_YEARS.year(),
					max: THIS_TIME_NEXT_5_YEARS.year(),
				},
			}}
		/>

		<EaseDatePicker
			{disabled}
			label={$T('common.endAt')}
			placeholder={$T('common.endAt')}
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
					min: THIS_TIME_LAST_5_YEARS.year(),
					max: THIS_TIME_NEXT_5_YEARS.year(),
				},
			}}
		/>
	</div>
</div>
