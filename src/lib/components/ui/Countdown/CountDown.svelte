<script lang="ts">
	import { T } from '$i18n';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import { onMount } from 'svelte';

	dayjs.extend(duration);

	type Props = {
		destination: string;
	};

	let { destination }: Props = $props();

	const Future = destination ? dayjs(destination) : dayjs();

	const COUNTDOWN_KEYS = {
		days: 'countdown.days',
		hours: 'countdown.hours',
		min: 'countdown.min',
		sec: 'countdown.sec',
	} as const;

	let countdown = $state.raw<Record<keyof typeof COUNTDOWN_KEYS, number>>({
		days: 0,
		hours: 0,
		min: 0,
		sec: 0,
	});
	let interval = $state<NodeJS.Timeout>();

	function updateCountdown() {
		const now = dayjs();
		const diffMs = Future.diff(now);

		if (diffMs <= 0) {
			countdown = { days: 0, hours: 0, min: 0, sec: 0 };
			return;
		}

		const dur = dayjs.duration(diffMs);

		countdown = {
			days: Math.floor(dur.asDays()),
			hours: dur.hours(),
			min: dur.minutes(),
			sec: dur.seconds(),
		};
	}

	onMount(() => {
		updateCountdown();
		interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex items-center gap-1" aria-live="off">
	{#each Object.entries(countdown) as [key, value], idx (idx)}
		<div
			class="flex flex-col items-center rounded-lg bg-brand-800 text-white min-w-9 px-1.5 py-1 shadow-sm"
		>
			<span class="font-mono text-sm font-bold tabular-nums leading-none">{value}</span>
			<span class="text-[9px] uppercase tracking-wide text-white/70 mt-0.5">
				{$T(COUNTDOWN_KEYS[key as keyof typeof COUNTDOWN_KEYS])}
			</span>
		</div>
	{/each}
</div>
