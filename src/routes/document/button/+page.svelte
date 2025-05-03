<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button, IconButton, type ButtonVariant } from '$lib/components/ui/Button';
	import type { SocialColor, SocialSize } from '$lib/components/ui/common';
	import { RadioButton } from '$lib/components/ui/Input';
	import { toastStore } from '$lib/stores/ui/toast';

	const socialColors: SocialColor[] = [
		'dark',
		'gray',
		'red',
		'pink',
		'grape',
		'violet',
		'indigo',
		'blue',
		'cyan',
		'teal',
		'green',
		'lime',
		'yellow',
		'orange'
	];

	const socialSizes: SocialSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

	let variant = $state<ButtonVariant>('filled');

	const handleCopyButton = (btnType: 'normal' | 'icon', color: SocialColor, size: SocialSize) => {
		const tagName = btnType === 'normal' ? 'Button' : 'IconButton';
		let codeContent = `<${tagName} variant="${variant}" color="${color}" size="${size}"`;
		if (btnType === 'icon') {
			codeContent += ` icon={Email} />`;
		} else {
			codeContent += `>replace_me</${tagName}>`;
		}

		navigator.clipboard.writeText(codeContent).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${codeContent}`,
				timeout: 5000
			});
		});
	};
</script>

<div>Variant Control</div>

<div class="flex gap-2 items-center mb-3">
	<RadioButton bind:group={variant} value="filled" label="Filled" />
	<RadioButton bind:group={variant} value="light" label="Light" />
	<RadioButton bind:group={variant} value="outline" label="Outline" />
	<RadioButton bind:group={variant} value="gradient" label="Gradient" />
</div>

<div>Buttons</div>

{#each socialSizes as size, idx (idx)}
	<div class="flex items-start gap-2 mb-3 flex-wrap">
		{#each socialColors as color, idx (idx)}
			<Button {variant} {color} {size} onclick={() => handleCopyButton('normal', color, size)}>
				{color}
				{size}
			</Button>
		{/each}
	</div>
{/each}

<div>Icon Buttons</div>

{#each socialSizes as size, idx (idx)}
	<div class="flex items-start gap-2 mb-3">
		{#each socialColors as color, idx (idx)}
			<div class="flex flex-col gap-1">
				<IconButton
					{variant}
					{color}
					{size}
					icon={Email}
					onclick={() => handleCopyButton('icon', color, size)}
				/>
				<div>{color} {size}</div>
			</div>
		{/each}
	</div>
{/each}
