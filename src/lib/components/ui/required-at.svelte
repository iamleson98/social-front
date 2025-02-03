<script lang="ts">
	type Props = {
		class?: string;
		required?: boolean;
		label: string;
		pos?: 'start' | 'end';
	};

	let { class: className = '', required = true, label, pos = 'start' }: Props = $props();
</script>

<span class="flex items-center gap-2 {className}">
	{#if required && pos === 'start'}
		<strong class="text-red-500">*</strong>
	{/if}
	<span>
		{label}
	</span>
	{#if required && pos === 'end'}
		<strong class="text-red-500">*</strong>
	{/if}
</span>
