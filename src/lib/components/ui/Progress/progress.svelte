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
</script>

<div class={`${bgColorClass} rounded-full h-3`}>
	<div class={`${fgColorClass} h-full rounded-full`} style={`width: ${percent}%`}></div>
</div>
