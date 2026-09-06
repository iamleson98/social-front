<script lang="ts">
	import Hero from './hero.svelte';
	import ProductListSection from './product-list-section.svelte';
	import RecommendationSection from './recommendation-section.svelte';
	import Sidebar from './sidebar.svelte';
</script>

<div class="space-y-5">
	<Hero />

	<div class="flex gap-6">
		<aside
			class="sticky overflow-y-auto top-[100px] max-tablet:top-[146px] h-fit max-h-[calc(100vh-7rem)] w-1/5 max-tablet:hidden!"
			style="scrollbar-width: none;"
		>
			<Sidebar />
		</aside>

		<div class="w-4/5 flex gap-3 max-tablet:w-full">
			<div class="w-3/4 max-tablet:w-full">
				<ProductListSection />
			</div>
			<div class="w-1/4 max-tablet:hidden sticky top-[100px] h-fit" style="scrollbar-width: none;">
				<RecommendationSection />
			</div>
		</div>
	</div>
</div>
