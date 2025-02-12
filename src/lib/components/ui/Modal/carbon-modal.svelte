<script lang="ts">
	import { createEventDispatcher, type Snippet } from 'svelte';
	import Close from '../icons/Close.svelte';
	import Button from '../Button/Button.svelte';
	import { trackModal } from './modal-sore';
	import { writable } from 'svelte/store';
	import type { SocialSize } from '../common';
	import { randomString } from '$lib/utils/utils';

	type Props = {
		size?: SocialSize;
		class?: string;
		passiveModal?: boolean;
		open?: boolean;
		danger?: boolean;
		alert?: boolean;
		modalHeading?: string;
		modalLabel?: string;
		modalAriaLabel?: string;
		iconDescription?: string;
		hasForm?: boolean;
		hasScrollingContent?: boolean;
		primaryButtonText?: string;
		primaryButtonDisabled?: boolean;
		primaryButtonIcon?: any;
		secondaryButtonText?: string;
		secondaryButtons?: [{ text: string }, { text: string }];
		selectorPrimaryFocus?: string;
		preventCloseOnClickOutside?: boolean;
		shouldSubmitOnEnter?: boolean;
		id?: string;
		onOpen?: () => void;
		onClose?: () => void;
		children?: Snippet;
		ariaLabel?: string;
		// onclick?: () => void;
		onmouseenter?: () => void;
		onmouseleave?: () => void;
		onmouseover?: () => void;
	};

	let {
		class: className = '',
		children,
		size = 'md',
		open = false,
		passiveModal = false,
		danger = false,
		alert = false,
		modalHeading = '',
		modalLabel = '',
		modalAriaLabel = '',
		iconDescription = 'Close the modal',
		hasForm = false,
		hasScrollingContent = false,
		primaryButtonText = '',
		primaryButtonDisabled = false,
		primaryButtonIcon = null,
		secondaryButtonText = '',
		secondaryButtons = [],
		shouldSubmitOnEnter = true,
		selectorPrimaryFocus = '[data-modal-primary-focus]',
		preventCloseOnClickOutside = false,
		id = randomString(),
		onOpen = null,
		onClose = null,
		ariaLabel,
		onmouseenter,
		onmouseleave,
		onmouseover
	}: Props = $props();
	/**
	 * Set the size of the modal
	 * @type {"xs" | "sm" | "lg"}
	 */
	// export let size = undefined;

	/** Set to `true` to open the modal */
	// export let open = false;

	/** Set to `true` to use the danger variant */
	// export let danger = false;

	/** Set to `true` to enable alert mode */
	// export let alert = false;

	/** Set to `true` to use the passive variant */
	// export let passiveModal = false;

	/**
	 * Specify the modal heading
	 * @type {string}
	 */
	// export let modalHeading = undefined;

	/**
	 * Specify the modal label
	 * @type {string}
	 */
	// export let modalLabel = undefined;

	/**
	 * Specify the ARIA label for the modal
	 * @type {string}
	 */
	// export let modalAriaLabel = undefined;

	/** Specify the ARIA label for the close icon */
	// export let iconDescription = 'Close the modal';

	/** Set to `true` if the modal contains form elements */
	// export let hasForm = false;

	/** Set to `true` if the modal contains scrolling content */
	// export let hasScrollingContent = false;

	/** Specify the primary button text */
	// export let primaryButtonText = '';

	/** Set to `true` to disable the primary button */
	// export let primaryButtonDisabled = false;

	/**
	 * Specify the primary button icon
	 * @type {any}
	 */
	// export let primaryButtonIcon = undefined;

	/**
	 * Set to `true` for the "submit" and "click:button--primary" events
	 * to be dispatched when pressing "Enter"
	 */
	// export let shouldSubmitOnEnter = true;

	/** Specify the secondary button text */
	// export let secondaryButtonText = '';

	/**
	 * 2-tuple prop to render two secondary buttons for a 3 button modal
	 * supersedes `secondaryButtonText`
	 * @type {[{ text: string; }, { text: string; }]}
	 */
	// export let secondaryButtons = [];

	/** Specify a selector to be focused when opening the modal */
	// export let selectorPrimaryFocus = '[data-modal-primary-focus]';

	/** Set to `true` to prevent the modal from closing when clicking outside */
	// export let preventCloseOnClickOutside = false;

	/** Set an id for the top-level element */
	// export let id = 'ccs-' + Math.random().toString(36);

	/** Obtain a reference to the top-level HTML element */
	let ref = $state<HTMLDivElement>();

	const dispatch = createEventDispatcher();

	let buttonRef = $state<HTMLButtonElement>();
	let innerModal = $state<HTMLDivElement>();
	let opened = false;
	let didClickInnerModal = false;

	function focus(element?: HTMLElement) {
		const node = ((element || innerModal).querySelector(selectorPrimaryFocus) ||
			buttonRef) as HTMLElement;
		node?.focus();
	}

	const openStore = writable(open);
	// $: $openStore = open;
	$effect(() => {
		openStore.set(open);
	});
	trackModal(openStore);

	$effect(() => {
		if (opened) {
			if (!open) {
				opened = false;
				dispatch('close');
			}
		} else if (open) {
			opened = true;
			focus();
			dispatch('open');
		}
	});

	$: modalLabelId = `bx--modal-header__label--modal-${id}`;
	$: modalHeadingId = `bx--modal-header__heading--modal-${id}`;
	$: modalBodyId = `bx--modal-body--${id}`;
	$: ariaLabel = modalLabel || ariaLabel || modalAriaLabel || modalHeading;
</script>

<div
	bind:this={ref}
	role="presentation"
	{id}
	class:bx--modal={true}
	class:bx--modal-tall={!passiveModal}
	class:is-visible={open}
	class:bx--modal--danger={danger}
	onkeydown={(e) => {
		if (open) {
			if (e.key === 'Escape') {
				open = false;
			} else if (e.key === 'Tab') {
				// trap focus

				// taken from github.com/carbon-design-system/carbon/packages/react/src/internal/keyboard/navigation.js
				const selectorTabbable = `
  a[href], area[href], input:not([disabled]):not([tabindex='-1']),
  button:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']),
  textarea:not([disabled]):not([tabindex='-1']),
  iframe, object, embed, *[tabindex]:not([tabindex='-1']):not([disabled]), *[contenteditable=true]
`;

				const tabbable = Array.from(ref!.querySelectorAll(selectorTabbable));

				let index = tabbable.indexOf(document.activeElement);
				if (index === -1 && e.shiftKey) index = 0;

				index += tabbable.length + (e.shiftKey ? -1 : 1);
				index %= tabbable.length;

				tabbable[index].focus();
				e.preventDefault();
			} else if (shouldSubmitOnEnter && e.key === 'Enter' && !primaryButtonDisabled) {
				dispatch('submit');
				dispatch('click:button--primary');
			}
		}
	}}
	onclick={() => {
		if (!didClickInnerModal && !preventCloseOnClickOutside) open = false;
		didClickInnerModal = false;
	}}
	{onmouseover}
	{onmouseenter}
	{onmouseleave}
	ontransitionend={(e) => {
		if (e.propertyName === 'transform') {
			dispatch('transitionend', { open });
		}
	}}
>
	<div
		bind:this={innerModal}
		tabindex="-1"
		role={alert ? (passiveModal ? 'alert' : 'alertdialog') : 'dialog'}
		aria-describedby={alert && !passiveModal ? modalBodyId : undefined}
		aria-modal="true"
		aria-label={ariaLabel}
		class:bx--modal-container={true}
		class:bx--modal-container--xs={size === 'xs'}
		class:bx--modal-container--sm={size === 'sm'}
		class:bx--modal-container--lg={size === 'lg'}
		onclick={() => {
			didClickInnerModal = true;
		}}
	>
		<div class:bx--modal-header={true}>
			{#if passiveModal}
				<button
					bind:this={buttonRef}
					type="button"
					aria-label={iconDescription}
					class:bx--modal-close={true}
					onclick={() => {
						open = false;
					}}
				>
					<Close size={20} class="bx--modal-close__icon" aria-hidden="true" />
				</button>
			{/if}
			{#if modalLabel}
				<h2 id={modalLabelId} class:bx--modal-header__label={true}>
					<slot name="label">{modalLabel}</slot>
				</h2>
			{/if}
			<h3 id={modalHeadingId} class:bx--modal-header__heading={true}>
				<slot name="heading">{modalHeading}</slot>
			</h3>
			{#if !passiveModal}
				<button
					bind:this={buttonRef}
					type="button"
					aria-label={iconDescription}
					class:bx--modal-close={true}
					onclick={() => {
						open = false;
					}}
				>
					<Close size={20} class="bx--modal-close__icon" aria-hidden="true" />
				</button>
			{/if}
		</div>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			id={modalBodyId}
			class:bx--modal-content={true}
			class:bx--modal-content--with-form={hasForm}
			class:bx--modal-scroll-content={hasScrollingContent}
			tabindex={hasScrollingContent ? 0 : undefined}
			role={hasScrollingContent ? 'region' : undefined}
			aria-label={hasScrollingContent ? ariaLabel : undefined}
			aria-labelledby={modalLabel ? modalLabelId : modalHeadingId}
		>
			<!-- <slot /> -->
			{@render children?.()}
		</div>
		{#if hasScrollingContent}
			<div class:bx--modal-content--overflow-indicator={true}></div>
		{/if}
		{#if !passiveModal}
			<div
				class:bx--modal-footer={true}
				class:bx--modal-footer--three-button={secondaryButtons.length === 2}
			>
				{#if secondaryButtons.length > 0}
					{#each secondaryButtons as button}
						<Button
							color="red"
							onclick={() => {
								dispatch('click:button--secondary', { text: button.text });
							}}
						>
							{button.text}
						</Button>
					{/each}
				{:else if secondaryButtonText}
					<Button
						color="red"
						onclick={() => {
							dispatch('click:button--secondary', {
								text: secondaryButtonText
							});
						}}
					>
						{secondaryButtonText}
					</Button>
				{/if}
				<Button
					color={danger ? 'red' : 'blue'}
					disabled={primaryButtonDisabled}
					onclick={() => {
						dispatch('submit');
						dispatch('click:button--primary');
					}}
				>
					{primaryButtonText}
				</Button>
			</div>
		{/if}
	</div>
</div>
