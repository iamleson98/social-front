<script lang="ts">
</script>

<div>
	<div class="common mb-2 inline-block w-[320px]">
		<p class="font-bold text-lg">mobile Small - 320px</p>
		<code>mobile-s</code>
	</div>
	<div class="common w-[375px] mb-2">
		<p class="font-bold text-lg">mobile Medium - 375px</p>
		<code>mobile-m</code>
	</div>
	<div class="common w-[425px] mb-2">
		<p class="font-bold text-lg">mobile large - 425px</p>
		<code>mobile-l</code>
	</div>
	<div class="common w-[768px] mb-2">
		<p class="font-bold text-lg">tablet - 768px</p>
		<code>tablet</code>
	</div>
	<div class="common w-[1024px] mb-2">
		<p class="font-bold text-lg">laptop - 1024px</p>
		<code>laptop</code>
	</div>
	<div class="tablet:bg-red-200! mb-2 common w-[1440px]">
		<p class="font-bold text-lg">desktop - 1440px</p>
		<code>desktop</code>
	</div>
	<div class="common w-[2560px] mb-2 desktop:bg-red-200">
		<p class="font-bold text-lg">desktop large - 2560px</p>
		<code>desktop-l</code>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.common {
		@apply rounded-lg border border-blue-400 bg-blue-200 p-2 mb-2;
	}
</style>
