<script lang="ts">
	import { ClosedEye, Icon, Lock, OpenEye } from '$lib/components/icons';
	import Input, { type Props } from './input.svelte';

	let {
		size,
		placeholder,
		value = $bindable(),
		showAction = true,
		...rest
	}: Omit<Props, 'action'> & { showAction?: boolean } = $props();

	type passwordDisplay = 'password' | 'text';

	let passwordFieldType: passwordDisplay = $state('password');
	let passwordDisplayIcon = $derived.by(() =>
		passwordFieldType === 'password' ? OpenEye : ClosedEye
	);

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');
</script>

{#snippet passwordAction()}
	{#if showAction}
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<span
			class={`rounded-full ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'} bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer select-none`}
			role="button"
			onclick={togglePasswordType}
		>
			<Icon icon={passwordDisplayIcon} />
		</span>
	{/if}
{/snippet}

<Input
	placeholder={placeholder || 'Enter password'}
	bind:value
	startIcon={Lock}
	action={passwordAction}
	type={passwordFieldType}
	{size}
	{...rest}
/>
