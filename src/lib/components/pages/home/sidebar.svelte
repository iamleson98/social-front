<script lang="ts">
	import CategoriesAccordion from './sidebar-category.svelte';
	import SidebarPriceRange from './sidebar-price-range.svelte';
	import SidebarRating from './sidebar-rating.svelte';
</script>

<div>
	<CategoriesAccordion />
	<SidebarRating />
	<SidebarPriceRange onChange={console.log} currency="₫" />
</div>
