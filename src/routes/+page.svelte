<script lang="ts">
	import { userStore } from '$lib/stores/auth';
</script>

<svelte:head>
	<title>Sitename</title>
</svelte:head>

<div>
	{$userStore}
</div>
