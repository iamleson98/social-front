<script lang="ts">
	import { SkeletonContainer } from '../Skeleton';
	import { Skeleton } from '$lib/components/ui/Skeleton';

	type Props = {
		label?: boolean;
	};

	let { label }: Props = $props();
</script>

<SkeletonContainer class="flex items-center gap-2">
	<Skeleton class="h-5 w-5" />
	{#if label}
		<Skeleton class="h-5 w-20" />
	{/if}
</SkeletonContainer>
