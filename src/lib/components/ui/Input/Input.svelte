<script lang="ts">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';
	import type { InputAutoComplete, InputVariant } from './types';
	import Icon from '@iconify/svelte';

	export let value: any = '';
	export let type: HTMLInputTypeAttribute = 'text';
	export let element: HTMLElement | null = null;
	export let classes: string = '';
	export let id: string | null = null;
	export let placeholder: string = '';
	export let required: boolean = false;
	export let invalid: boolean = false;
	export let disabled: boolean = false;
	export let autocomplete: InputAutoComplete = 'on';
  export let variant: InputVariant = 'default';
  export let icon: string | null = null;
  export let tabindex: number | null = null;
  export let fullWidth: boolean = false;
</script>

<div class={`input-container ${classes} ${invalid ? 'input-invalid' : 'text-gray-500'} ${fullWidth ? 'w-full' : ''}`} >
  {#if icon}
    <span class="mr-2">
      <Icon {icon} class="input-icon" />
    </span>
  {/if}
	<input
		{value}
		{type}
		{id}
		{placeholder}
		{required}
		{disabled}
		{autocomplete}
    {tabindex}
		aria-invalid={invalid}
		bind:this={element}
		class={`input input-${variant} `}
    class:has-action={$$slots.action}
	/>
  <slot name='action' />
</div>

<style lang="postcss">
	.input:disabled, input:disabled {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    -khtml-user-select: none !important;
    -webkit-touch-callout: none !important;
    pointer-events: none !important;
    cursor: not-allowed !important;
  }
  .input {
    outline: none !important;
    @apply border-none h-7 leading-8 bg-transparent;
  }
  .input-invalid {
    @apply border-red-500 text-red-500 border;
  }

  .input-filled {

  }
  .input-default {
  }
  .input-icon {
    color: inherit;
    font-size: inherit;
  }
  .input-container {
    @apply inline-flex flex-nowrap flex-row items-center rounded-lg bg-gray-100 px-1;
  }
  .has-action {
    @apply mr-2;
  }
</style>
