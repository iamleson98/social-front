<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { CloseX } from '$lib/components/icons';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { modalSizeMap, type ModalProps } from './types';
	import { noop } from 'es-toolkit';
	import { fly } from 'svelte/transition';

	let {
		size = 'md',
		open = $bindable(),
		header,
		children,
		okText = 'Ok',
		cancelText = 'Cancel',
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
</script>

{#if open}
	<div
		class="fixed bg-black/50 z-100000003 top-0 left-0 bottom-0 right-0 overflow-x-hidden overflow-y-auto flex items-center justify-center"
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
		>
			<!-- content -->
			<div class="bg-white rounded-lg shadow-sm dark:bg-gray-700" transition:fly={{ y: 20 }}>
				<!-- header -->
				{#if !hideHeader}
					<div
						class="flex items-center justify-between px-4 py-3 tablet:p-5 border-b rounded-t dark:border-gray-600"
					>
						<h3 class="text-lg font-medium text-gray-900 dark:text-white">{header}</h3>
						<div>
							<IconButton
								icon={CloseX}
								size="xs"
								variant="light"
								color="gray"
								onclick={() => innerClose('x')}
								rounded
								disabled={disableElements || disableCloseBtn}
							/>
						</div>
					</div>
				{/if}

				<!-- modal body -->
				<div class="p-4 tablet:p-5">
					{@render children()}
				</div>

				<!-- modal footer -->
				{#if !hideFooter}
					<div class="border-t px-4 py-3 text-right">
						<div>
							<Button
								variant="filled"
								color="blue"
								size="sm"
								onclick={onOk}
								disabled={disableElements || disableOkBtn}>{okText}</Button
							>
							<Button
								variant="light"
								color="red"
								size="sm"
								class="mr-1"
								onclick={() => innerClose('cancel')}
								disabled={disableElements || disableCancelBtn}
							>
								{cancelText}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
