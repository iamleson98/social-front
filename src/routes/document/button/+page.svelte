<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button, IconButton, type ButtonVariant } from '$lib/components/ui/Button';
	import type { SocialColor, SocialSize } from '$lib/components/ui/common';
	import { Checkbox, RadioButton } from '$lib/components/ui/Input';
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
	const buttonvariants: ButtonVariant[] = ['filled', 'light', 'outline', 'gradient'];

	let variant = $state<ButtonVariant>('filled');
	let disabled = $state(false);
	let startIcon = $state(false);
	let endIcon = $state(false);
	let loading = $state(false);

	const handleCopyButton = (btnType: 'normal' | 'icon', color: SocialColor, size: SocialSize) => {
		const tagName = btnType === 'normal' ? 'Button' : 'IconButton';
		let codeContent = `<${tagName} variant="${variant}" color="${color}" size="${size}"`;
		if (disabled) codeContent += ` disabled`;
		if (loading) codeContent += ` loading`;
		if (startIcon) codeContent += ` startIcon={Email}`;
		if (endIcon) codeContent += ` endIcon={Email}`;

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
	{#each buttonvariants as btnVariant, idx (idx)}
		<RadioButton bind:group={variant} value={btnVariant} label={btnVariant} />
	{/each}
</div>

<div>disable control</div>
<Checkbox bind:checked={disabled} label="Disabled" />

<div>icons control</div>
<Checkbox bind:checked={startIcon} label="Start Icon" />
<Checkbox bind:checked={endIcon} label="End Icon" />

<div>loading control</div>
<Checkbox bind:checked={loading} label="Loading" />

<div class="mt-5">Buttons</div>

{#each socialSizes as size, idx (idx)}
	<div class="flex items-start gap-2 mb-3 flex-wrap">
		{#each socialColors as color, idx (idx)}
			<Button
				{variant}
				{color}
				{size}
				onclick={() => handleCopyButton('normal', color, size)}
				{disabled}
				startIcon={startIcon ? Email : undefined}
				endIcon={endIcon ? Email : undefined}
				loading={loading}
			>
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
					{disabled}
					loading={loading}
					onclick={() => handleCopyButton('icon', color, size)}
				/>
				<div>{color} {size}</div>
			</div>
		{/each}
	</div>
{/each}
