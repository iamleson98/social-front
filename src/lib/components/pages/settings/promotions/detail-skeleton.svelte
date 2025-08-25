<script lang="ts">
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
	<Skeleton class="w-1/4 h-3" />

	<div class="flex gap-2 items-start">
		<SelectSkeleton label size="md" />
		<SelectSkeleton label size="md" />
	</div>

	<SelectSkeleton label size="md" />

	<div class="flex gap-2 items-start">
		<SelectSkeleton label size="md" />
		<SelectSkeleton label size="md" />
	</div>
</div>
