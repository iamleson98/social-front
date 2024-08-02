<script lang="ts">
	import { Icon, Star } from '$lib/components/icons';
	import { MAX_RATING } from '$lib/utils/consts';

	interface Props {
		rating: number;
	}

	let { rating }: Props = $props();

	let percent = $derived((rating / MAX_RATING) * 100);
</script>

<div class="">
	<div class="bg-red-500 inline-flex" style={`width: ${percent}%;`}>
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
		<Icon icon={Star} />
	</div>
</div>
