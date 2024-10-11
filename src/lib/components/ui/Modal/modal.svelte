<script module>
	export type Props = {
		size: SocialSize;
		open: boolean;
		header: string;
		children: Snippet;
		okText?: string;
		cancelText?: string;
		onOk?: () => void;
		onCancel?: () => void;
		onClose?: () => void;
		hideHeader?: boolean;
		hideFooter?: boolean;
	};
</script>

<script lang="ts">
	import { CloseX } from '$lib/components/icons';
	import type { Snippet } from 'svelte';
	import { Button, IconButton } from '../Button';
	import type { SocialSize } from '../common';
	import { modalSizeMap } from './types';
	import { fly } from 'svelte/transition';
	import { tClient } from '$i18n';
	import { noop } from '$lib/utils/utils';

	let {
		size = 'md',
		open,
		header,
		children,
		okText = tClient('common.ok'),
		cancelText = tClient('common.cancel'),
		onOk = noop,
		onCancel = noop,
		onClose = noop,
		hideHeader = false,
		hideFooter = false
	}: Props = $props();
</script>

{#if open}
	<div class="modal-bg">
		<div class={`relative w-full max-h-full ${modalSizeMap[size]}`}>
			<!-- content -->
			<div class="bg-white rounded-lg shadow dark:bg-gray-700" transition:fly={{ y: 20 }}>
				<!-- header -->
				{#if !hideHeader}
					<div
						class="flex items-center justify-between px-4 py-3 tablet:p-5 border-b rounded-t dark:border-gray-600"
					>
						<h3 class="text-lg font-medium text-gray-900 dark:text-white">{header}</h3>
						<IconButton
							icon={CloseX}
							size="xs"
							variant="light"
							color="red"
							onclick={onClose}
							rounded
						/>
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
							<Button variant="filled" color="blue" size="sm" onclick={onOk}>{okText}</Button>
							<Button variant="light" color="red" size="sm" class="mr-1" onclick={onCancel}>
								{cancelText}
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal-bg {
		@apply fixed bg-black bg-opacity-50 z-50 top-0 left-0 bottom-0 right-0 overflow-x-hidden overflow-y-auto flex items-center justify-center;
	}
</style>
