<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class="flex gap-2">
	<div class="w-3/5 {SitenameCommonClassName}">
		<Skeleton class="w-2/3 h-6" />
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>

	<div class="w-2/5 {SitenameCommonClassName}">
		<Skeleton class="w-2/3 h-6" />
		<SelectSkeleton label />
	</div>
</div>
