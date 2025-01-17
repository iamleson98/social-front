<script lang="ts">
	type Props = {
		/** tailwind classes. E.g `w-5 h-5` */
		class: string;
		rounded?: boolean;
	};

	let { class: className, rounded = true }: Props = $props();
</script>

<div
	class={`bg-gray-300 ${className} animate-pulse ${rounded ? 'rounded-full' : 'rounded-md'}`}
></div>
