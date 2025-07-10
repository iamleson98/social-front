<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
</script>

<div class="flex flex-row gap-2">
	<div class="w-6/10 bg-white border border-gray-200 rounded-lg">
		<SkeletonContainer class="flex flex-col gap-3 p-4">
			<div class="flex flex-row gap-3">
				<div class="flex flex-col w-1/2">
					<Skeleton class="h-4 w-16 mb-2" />
					<Skeleton class="h-8" />
				</div>
				<div class="flex flex-col w-1/2">
					<Skeleton class="h-4 w-16 mb-2" />
					<Skeleton class="h-8" />
				</div>
			</div>
			<div>
				<Skeleton class="h-4 w-16 mb-2" />
				<Skeleton class="h-8" />
			</div>
			<div class="flex flex-row gap-3">
				<Skeleton class="h-8 w-8" />
				<Skeleton class="h-8 w-18" />
			</div>
			<div>
				<Skeleton class="h-4 w-16 mb-2" />
				<Skeleton class="h-8" />
			</div>
		</SkeletonContainer>
	</div>

	<div class="w-4/10 bg-white border border-gray-200 rounded-lg">
		<SkeletonContainer class="p-4">
			<Skeleton class="h-8 mb-5" />
			<Skeleton class="h-8" />
		</SkeletonContainer>
	</div>
</div>
