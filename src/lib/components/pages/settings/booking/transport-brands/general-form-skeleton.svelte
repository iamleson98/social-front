<script>
	import { Skeleton } from '$lib/components/ui/Skeleton';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { SitenameCommonClassName } from '$lib/utils/utils';
</script>

<div class={SitenameCommonClassName}>
	<Skeleton class="w-1/2 h-6" />

	<div class="grid grid-cols-2 gap-2">
		<SelectSkeleton label />
		<SelectSkeleton label />
	</div>
	<div class="grid grid-cols-2 gap-2">
		<SelectSkeleton label />

		<SelectSkeleton label />
	</div>
	<SelectSkeleton label />
</div>
