<script lang="ts">
	import type { IconType } from '$lib/components/icons';
	import { randomID } from '$lib/utils/utils';
	import { IconButton } from '../Button';
	import type { SocialColor, SocialSize } from '../common';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		icon: IconType;
		accept: string;
		color?: SocialColor;
		size?: SocialSize;
		multiple?: boolean;
		onChange: (fileList: FileList) => void;
		disabled?: boolean;
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
		...rest
	}: Props = $props();
</script>

<div {...rest}>
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
