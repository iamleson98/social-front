<script lang="ts">
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import { onMount } from 'svelte';

	dayjs.extend(duration);

	type Props = {
		destination: string;
	};

	let { destination }: Props = $props();

	const Future = destination ? dayjs(destination) : dayjs();

	let countdown = $state.raw<Record<string, number>>({ days: 0, hours: 0, min: 0, sec: 0 });
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

<div class="grid auto-cols-max grid-flow-col gap-1 text-center">
	{#each Object.entries(countdown) as [key, value], idx (idx)}
		<div class="bg-black text-white rounded-sm flex items-center flex-col p-1">
			<span class="font-mono countdown text-xs font-semibold" style="--value:{value};">
				<span>{value}</span>
			</span>
			<!-- <span class="text-[8px]">{key}</span> -->
		</div>
	{/each}
</div>
