<script lang="ts">
	import { Plus } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';

	let counter = $state(0);

	let doubleCounter = $derived.by(() => {
		if (counter % 3 === 0 && counter % 5 === 0) return 'FooBazz';
		if (counter % 3 === 0) return 'Foo';
		if (counter % 5 === 0) return 'Bazz';
		return 'Lol';
	});
</script>

<div>
	<div>
		<IconButton onclick={() => counter++} icon={Plus} />
		<p>{counter}</p>
		<p>{doubleCounter}</p>
	</div>

	<div class="common mb-2 inline-block w-80">
		<p class="font-bold text-lg">mobile Small - 320px</p>
		<code>mobile-s</code>
	</div>
	<div class="common w-[375px] mb-2">
		<p class="font-bold text-lg">mobile Medium - 375px</p>
		<code>mobile-</code>
	</div>
	<div class="common w-[425px] mb-2">
		<p class="font-bold text-lg">mobile large - 425px</p>
	</div>
	<div class="common w-[768px] mb-2">
		<p class="font-bold text-lg">tablet - 768px</p>
	</div>
	<div class="common w-[1024px] mb-2">
		<p class="font-bold text-lg">laptop - 1024px</p>
	</div>
	<div class="tablet:!bg-red-200 mb-2 common">
		<p class="font-bold text-lg">desktop - 1440px</p>
	</div>
	<div class="common w-[2560px] mb-2 desktop:bg-red-200">
		<p class="font-bold text-lg">desktop large - 2560px</p>
	</div>
</div>

<style lang="postcss">
	.common {
		@apply rounded-lg border border-blue-400 bg-blue-200 p-2 mb-2;
	}
</style>
