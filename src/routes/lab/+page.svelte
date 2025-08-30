<script lang="ts">
	import { Button } from '$lib/components/ui';
	import Com from './com.svelte';
	import { randomString } from '$lib/utils/utils';

	let comRef = $state<ReturnType<typeof Com>>();

	const update = () => {
		comRef?.control(randomString(20));
	};
</script>

<Com bind:this={comRef} />

<Button onclick={update}>update</Button>
