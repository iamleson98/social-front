<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { SocialSize } from '$lib/components/ui/common';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { toastStore } from '$lib/stores/ui/toast';
	import type { SocialVariant } from '$lib/utils';

	let label = $state(true);
	let placeholder = $state(false);
	let disabled = $state(false);
	let readonly = $state(false);
	let required = $state(false);
	// let value = $state('');
	let subText = $state(false);
	let withAction = $state(false);
	let variant = $state<SocialVariant>('info');
	let size = $state<SocialSize>('md');

	let startIcon = $state(false);

	const sizes: SocialSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
	const variants: SocialVariant[] = ['info', 'success', 'warning', 'error'];

	const handleCopy = () => {
		let text = `<Input `;
		if (label) text += `label="Sample label" `;
		if (placeholder) text += `placeholder="Sample placeholder" `;
		if (disabled) text += `disabled `;
		if (readonly) text += `readonly `;
		if (required) text += `required `;
		if (subText) text += `subText="Sample subtext" `;
		if (variant) text += `variant="${variant}" `;
		if (size) text += `size="${size}" `;
		if (startIcon) text += `startIcon={Email} `;
		if (withAction) text += `action={action} `;
		text += `/>`;

		navigator.clipboard.writeText(text).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${text}`,
				timeout: 5000
			});
		});
	};
</script>

<Checkbox bind:checked={label} label="Label" />

<Checkbox bind:checked={placeholder} label="Placeholder" />

<Checkbox bind:checked={disabled} label="Disabled" />

<Checkbox bind:checked={readonly} label="Readonly" />

<Checkbox bind:checked={required} label="Required" />

<Checkbox bind:checked={subText} label="Subtext" />

<Checkbox bind:checked={startIcon} label="Start Icon" />

<Checkbox bind:checked={withAction} label="With Action" />

<div class="mt-5 flex items-center gap-3">
	{#each variants as myVariant, idx (idx)}
		<RadioButton bind:group={variant} value={myVariant} label={myVariant} />
	{/each}
</div>

<div class="mt-5 flex items-center gap-3">
	{#each sizes as mySize, idx (idx)}
		<RadioButton bind:group={size} value={mySize} label={mySize} />
	{/each}
</div>

{#snippet action()}
	<Button variant="light" color="gray" size="xs">Action</Button>
{/snippet}

<div class="mt-5">
	<Input
		label={label ? 'Sample label' : undefined}
		placeholder={placeholder ? 'Sample placeholder' : undefined}
		{disabled}
		{readonly}
		{required}
		subText={subText ? 'Sample subtext' : undefined}
		{variant}
		{size}
		startIcon={startIcon ? Email : undefined}
		action={withAction ? action : undefined}
	/>
</div>
<div class="mt-5">
	<Button variant="light" onclick={handleCopy}>Copy config</Button>
</div>
