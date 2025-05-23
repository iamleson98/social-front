<script lang="ts">
	import SelectSkeleton from '$lib/components/ui/select/select-skeleton.svelte';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
</script>

<div class="flex gap-4 flex-col h-full bg-white border border-gray-200 rounded-lg p-4">
	<SkeletonContainer>
		<Skeleton class="h-18 w-18 rounded-full" />
	</SkeletonContainer>
	<div class="flex flex-row">
		<SkeletonContainer>
			<Skeleton class="h-4 w-16 mb-2"/>
			<SelectSkeleton/>
		</SkeletonContainer>
		<SkeletonContainer>
			<Skeleton class="h-4 w-16 mb-2"/>
			<SelectSkeleton/>
		</SkeletonContainer>
	</div>
	<SkeletonContainer>
		<Skeleton class="h-4 w-16 mb-2"/>
		<SelectSkeleton/>
	</SkeletonContainer>
	<div class="flex">
		<Skeleton class="h-4 w-4 mr-2"/>
		<Skeleton class="h-4 w-20"/>
	</div>
</div>
