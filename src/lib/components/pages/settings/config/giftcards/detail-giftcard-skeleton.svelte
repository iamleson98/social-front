<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
</script>

<div class="flex gap-2 flex-row">
	<div class="w-7/10 flex flex-col gap-2">
		<div class="flex gap-2 flex-col bg-white border border-gray-200 rounded-lg p-3">
			<Skeleton class="h-8 w-38 mb-2" />
			<div class="flex flex-row gap-2">
				<div class="w-7/10">
					<SelectSkeleton label size="sm" />
				</div>
				<div class="w-3/10">
					<SelectSkeleton label size="sm" />
				</div>
			</div>
			<SelectSkeleton label size="sm" />
			<SelectSkeleton />
		</div>
		
		<div class="flex gap-3 flex-col bg-white border border-gray-200 rounded-lg p-3">
			<div class="flex justify-between mb-3">
				<Skeleton class="h-6 w-28" />
				<Skeleton class="h-6 w-8" />
			</div>
			<Skeleton class="h-6 w-15" />
			<div class="flex justify-between mb-3">
				<Skeleton class="h-6 w-34" />
				<Skeleton class="h-6 w-8" />
			</div>
			<Skeleton class="h-6 w-15" />
		</div>

		<div class="bg-white border border-gray-200 rounded-lg p-3">
			<Skeleton class="h-8 w-38" />
		</div>
	</div>
	<div class="w-3/10">
		<div class="bg-white h-full border border-gray-200 rounded-lg p-3">
			<Skeleton class="h-8 w-28 mb-2" />
			<SelectSkeleton label size="sm" />
		</div>
	</div>
</div>
