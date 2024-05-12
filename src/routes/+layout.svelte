<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/common';
</script>



<Header />

<main class="mt-12">
	<slot />
</main>

<footer>
	<!-- <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p> -->
	<!-- {$userStore} -->
</footer>
