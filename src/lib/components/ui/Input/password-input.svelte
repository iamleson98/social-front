<script lang="ts">
	import { ClosedEye, Icon, Lock, OpenEye } from '$lib/components/icons';
	import Input from './input.svelte';
	import type { InputProps } from './input.types';
	import { type Snippet } from 'svelte';

	let {
		size,
		placeholder,
		value = $bindable(),
		showAction,
		...rest
	}: Omit<InputProps, 'action'> & { showAction?: boolean } = $props();

	type passwordDisplay = 'password' | 'text';

	let passwordFieldType: passwordDisplay = $state('password');

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');
</script>

{#snippet passwordAction()}
	<span
		class={`rounded-full ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'} bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer select-none`}
		role="button"
		onclick={togglePasswordType}
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && togglePasswordType()}
	>
		<Icon icon={passwordFieldType === 'password' ? OpenEye : ClosedEye} />
	</span>
{/snippet}

<Input
	{placeholder}
	bind:value
	startIcon={Lock}
	action={showAction ? (passwordAction as Snippet<[]>) : undefined}
	type={passwordFieldType}
	{size}
	{...rest}
/>
