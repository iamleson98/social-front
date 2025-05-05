<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
</script>

<div class="flex gap-2 flex-col h-full bg-white border border-gray-200 rounded-lg">
	<SkeletonContainer class="p-4">
		<Skeleton class="h-18 w-18 rounded-full" />
	</SkeletonContainer>
	<div class="flex flex-row">
		<SkeletonContainer class="w-1/2">
			<Skeleton class="h-4 w-16 mb-2" />
			<Skeleton class="h-8 w-full" />
		</SkeletonContainer>
		<SkeletonContainer class="w-1/2">
			<Skeleton class="h-4 w-16 mb-2" />
			<Skeleton class="h-8 w-full" />
		</SkeletonContainer>
	</div>
	<SkeletonContainer class="p-4">
		<Skeleton class="h-4 w-16 mb-2" />
		<Skeleton class="h-8 w-full" />
	</SkeletonContainer>
	<div class="flex p-4">
		<Skeleton class="h-4 w-4 mr-2" />
		<Skeleton class="h-4 w-20" />
	</div>
</div>
