<script lang="ts">
	type Props = {
		class: string;
		rounded?: boolean;
	};

	let { class: className, rounded = true }: Props = $props();
</script>

<div
	class={`bg-gray-300 ${className} animate-pulse ${rounded ? 'rounded-full' : 'rounded-md'}`}
></div>
