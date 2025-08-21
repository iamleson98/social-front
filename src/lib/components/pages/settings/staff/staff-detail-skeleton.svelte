<script lang="ts">
	import { CheckboxSkeleton } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
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
