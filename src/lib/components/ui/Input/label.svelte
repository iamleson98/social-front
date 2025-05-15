<script lang="ts">
	import type { SocialVariant } from '$lib/utils';
	import type { SocialSize } from '$lib/components/ui/common';
	import { INPUT_LABEL_SIZE_STYLE_MAP, INPUT_CLASSES } from './input.types';

	type Props = {
		class?: string;
		required?: boolean | null;
		size?: SocialSize;
		id?: string | null;
		variant?: SocialVariant | 'ghost';
		label: string;
		requiredAtPos?: 'start' | 'end';
	};

	let {
		class: className = '',
		required = false,
		size = 'md',
		id,
		variant = 'info',
		label,
		requiredAtPos = 'start'
	}: Props = $props();
</script>

<label
	for={id}
	class={`block select-none mb-1 ${INPUT_LABEL_SIZE_STYLE_MAP[size]} ${className} font-medium ${INPUT_CLASSES[variant].fg}`}
>
	{#if required && requiredAtPos === 'start'}<strong class="font-bold text-red-600!">*</strong>{/if}

	{label}

	{#if required && requiredAtPos === 'end'}<strong class="font-bold text-red-600!">*</strong>{/if}
</label>
