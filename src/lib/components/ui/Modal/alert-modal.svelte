<script lang="ts">
	import { tClient } from '$i18n';
	import { AlertCircle, Icon } from '$lib/components/icons';
	import { Button } from '../Button';
	import Modal from './modal.svelte';
	import { type ModalProps } from './types';

	type Props = Omit<ModalProps, 'hideHeader' | 'hideFooter' | 'header' | 'size' | 'onClose'>;

	let {
		children,
		onOk,
		onCancel,
		okText = tClient('common.ok'),
		cancelText = tClient('common.cancel'),
		open
	}: Props = $props();
</script>

<Modal header="" size="xs" hideFooter hideHeader {open}>
	<div class="text-yellow-300 flex justify-center py-2">
		<Icon icon={AlertCircle} width="3rem" height="3rem" />
	</div>

	<div class="flex justify-center text-center">
		{@render children()}
	</div>

	<div class="flex gap-2 justify-center mt-5">
		<Button variant="filled" size="sm" color="red" onclick={onOk}>
			{okText}
		</Button>
		<Button variant="light" size="sm" color="green" onclick={onCancel}>
			{cancelText}
		</Button>
	</div>
</Modal>
