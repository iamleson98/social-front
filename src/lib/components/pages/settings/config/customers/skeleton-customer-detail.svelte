<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
</script>

<div class="flex flex-row gap-2">
	<SkeletonContainer class="w-2/5 flex flex-col gap-5">
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
	</SkeletonContainer>
	<SkeletonContainer class="w-3/5 flex flex-col gap-5">
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
		<Skeleton class="w-full h-8" />
	</SkeletonContainer>
</div>