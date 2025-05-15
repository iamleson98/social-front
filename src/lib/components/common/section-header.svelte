<script lang="ts">
	type Props = {
		title: string;
	};
	let { title }: Props = $props();
</script>

<div class="font-semibold text-gray-700 text-lg mb-2">{title}</div>
