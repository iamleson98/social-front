<script lang="ts">
	import type { IconType } from '$lib/components/icons';
	import { randomID } from '$lib/utils/utils';
	import { IconButton } from '../Button';
	import type { SocialColor, SocialSize } from '../common';
	import type { HTMLAttributes } from 'svelte/elements';
	import Label from './label.svelte';

	type Props = {
		icon: IconType;
		accept: string;
		color?: SocialColor;
		size?: SocialSize;
		multiple?: boolean;
		onChange: (fileList: FileList) => void;
		disabled?: boolean;
		label?: string;
		required?: boolean;
	} & HTMLAttributes<HTMLDivElement>;

	const INPUT_ID = randomID();
	let input = $state<HTMLInputElement>();

	let {
		icon,
		accept,
		color = 'blue',
		size = 'xl',
		multiple = false,
		onChange,
		disabled = false,
		label,
		required = false,
		...rest
	}: Props = $props();
</script>

<div {...rest}>
	{#if label}
		<Label id={INPUT_ID} {label} {size} {required} />
	{/if}
	<input
		type="file"
		bind:this={input}
		class="hidden!"
		{accept}
		onchange={(evt) => {
			if (evt.currentTarget.files) {
				onChange(evt.currentTarget.files);
				evt.currentTarget.files = null;
			}
		}}
		id={INPUT_ID}
		{multiple}
		{disabled}
	/>

	<label for={INPUT_ID}>
		<IconButton
			{icon}
			{size}
			{color}
			variant="outline"
			onclick={() => input?.click()}
			class="border-dashed!"
			{disabled}
		/>
	</label>
</div>
