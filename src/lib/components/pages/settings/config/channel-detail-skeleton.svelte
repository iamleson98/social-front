<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
</script>

<div class="flex gap-2 flex-row">
	<div class="w-2/3 bg-white border border-gray-200 rounded-lg">
		<SkeletonContainer class="p-4">
			<Skeleton class="h-4 w-16 mb-2" />
			<Skeleton class="h-8 w-full" />

			<div class="flex flex-row gap-3 mt-5">
				<div class="flex flex-col w-1/2">
					<Skeleton class="h-4 w-16 mb-2" />
					<Skeleton class="h-8 w-full" />
				</div>
				<div class="flex flex-row w-1/2 mt-6">
					<Skeleton class="h-8 w-8 mr-3" />
					<Skeleton class="h-8 w-24" />
				</div>
			</div>
			<div class="flex flex-row gap-3 mt-5">
				<div class="flex flex-col w-1/2">
					<Skeleton class="h-4 w-16 mb-2" />
					<Skeleton class="h-8 w-full" />
				</div>
				<div class="flex flex-col w-1/2">
					<Skeleton class="h-4 w-16 mb-2" />
					<Skeleton class="h-8 w-full" />
				</div>
			</div>
		</SkeletonContainer>
	</div>

	<div class="w-1/3 bg-white border border-gray-200 rounded-lg">
		<SkeletonContainer class="p-4">
			<Skeleton class="h-8 w-full mb-5" />
			<Skeleton class="h-8 w-full" />
		</SkeletonContainer>
	</div>
</div>
