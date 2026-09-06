<script lang="ts">
	import { T } from '$i18n';
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { focusTrap } from '$lib/actions/focus-trap';
	import { CloseX } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { modalSizeMap, type ModalProps } from './types';
	import { noop } from 'es-toolkit';
	import { fly, fade } from 'svelte/transition';

	let {
		size = 'md',
		open = $bindable(),
		header,
		children,
		okText,
		cancelText,
		onOk = noop,
		onCancel = noop,
		onClose = noop,
		hideHeader = false,
		hideFooter = false,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		disableElements = false,
		disableCloseBtn,
		disableCancelBtn,
		disableOkBtn,
	}: ModalProps = $props();

	// translated defaults (fall back to English when no key given)
	const resolvedOkText = $derived(okText || $T('common.ok'));
	const resolvedCancelText = $derived(cancelText || $T('common.cancel'));

	// lock body scroll while the dialog is open
	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	const innerClose = (evt: 'escape' | 'outside' | 'x' | 'cancel') => {
		open = false;
		if (
			(evt === 'outside' && closeOnOutsideClick) ||
			(evt === 'escape' && closeOnEscape) ||
			evt === 'x'
		) {
			onClose();
		} else if (evt === 'cancel') {
			onCancel();
		}
	};

	let headerId = `modal-header-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if open}
	<!-- z-index: toasts sit at 9999 (svelte-sonner), dialog must stay under it -->
	<div
		class="fixed bg-black/50 backdrop-blur-[2px] z-9998 top-0 left-0 bottom-0 right-0 overflow-x-hidden overflow-y-auto flex items-center justify-center p-4"
		transition:fade={{ duration: 150 }}
	>
		<div
			class={`relative w-full max-h-full ${modalSizeMap[size]}`}
			use:clickOutside={{
				onOutclick: () => innerClose('outside'),
				onEscape: () => innerClose('escape'),
			}}
			use:focusOutside={{
				onFocusOut: () => innerClose('outside'),
			}}
			use:focusTrap
		>
			<!-- content -->
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={hideHeader ? undefined : headerId}
				class="card-surface rounded-xl shadow-2xl dark:bg-gray-700"
				transition:fly={{ y: 24, duration: 200 }}
			>
				<!-- header -->
				{#if !hideHeader}
					<div
						class="flex items-center justify-between px-4 py-3 max-tablet:p-5 border-b rounded-t-xl dark:border-gray-600"
					>
						<h3 id={headerId} class="text-lg font-semibold text-gray-900 dark:text-white">
							{header}
						</h3>
						<div>
							<IconButton
								icon={CloseX}
								size="xs"
								variant="light"
								color="gray"
								aria-label={$T('common.close')}
								onclick={() => innerClose('x')}
								rounded
								disabled={disableElements || disableCloseBtn}
							/>
						</div>
					</div>
				{/if}

				<!-- modal body -->
				<div class="p-4 max-tablet:p-5">
					{@render children()}
				</div>

				<!-- modal footer -->
				{#if !hideFooter}
					<div class="border-t px-4 py-3 flex justify-end gap-2 rounded-b-xl dark:border-gray-600">
						<Button
							variant="light"
							color="gray"
							size="sm"
							onclick={() => innerClose('cancel')}
							disabled={disableElements || disableCancelBtn}
						>
							{resolvedCancelText}
						</Button>
						<Button
							variant="filled"
							color="blue"
							size="sm"
							onclick={onOk}
							disabled={disableElements || disableOkBtn}>{resolvedOkText}</Button
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
