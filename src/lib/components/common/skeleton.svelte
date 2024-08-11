<script lang="ts">
	type Props = {
		class: string;
	};

	let { class: className }: Props = $props();
</script>

<div class={`bg-gray-400 ${className} animate-pulse rounded-full`}></div>
