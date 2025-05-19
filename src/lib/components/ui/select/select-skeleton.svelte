<script lang="ts">
	import { INPUT_BUTTON_SIZE_MAP } from '../Button';
	import type { SocialSize } from '../common';
	import { SkeletonContainer } from '../Skeleton';
	import Skeleton from '../Skeleton/skeleton.svelte';

	type Props = {
		/**size of input skeleton*/
		size?: SocialSize | 'xxs';
		/**show label skeleton as well*/
		label?: boolean;
	};

	let { size = 'md', label }: Props = $props();
</script>

<SkeletonContainer>
	<!-- label -->
	{#if label}
		<Skeleton class="h-3 w-1/4 mb-1" />
	{/if}

	<!-- input -->
	<Skeleton class={INPUT_BUTTON_SIZE_MAP[size]} />
</SkeletonContainer>
