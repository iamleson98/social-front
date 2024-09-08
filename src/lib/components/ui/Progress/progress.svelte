<script lang="ts">
	type Props = {
		bgColorClass?: string;
		fgColorClass?: string;
		/** default `50` */
		percent?: number;
	};

	let {
		bgColorClass = 'bg-gray-200',
		fgColorClass = 'bg-yellow-300',
		percent = 50
	}: Props = $props();

	$effect(() => {
		if (percent < 0) percent = 0;
		if (percent > 100) percent = 100;
	});
</script>

<div class={`${bgColorClass} rounded-full h-3 min-w-28`}>
	<div class={`${fgColorClass} h-full rounded-full`} style={`width: ${percent}%`}></div>
</div>
