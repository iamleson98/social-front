<script lang="ts">
	import { CheckboxSkeleton } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
</script>

<div class="flex gap-4 flex-col h-full bg-white border border-gray-200 rounded-lg p-4">
	<SkeletonContainer>
		<Skeleton class="h-18 w-18 rounded-full" />
	</SkeletonContainer>
	<div class="flex flex-row gap-2">
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
	<SelectSkeleton label />
	<CheckboxSkeleton label />
</div>
