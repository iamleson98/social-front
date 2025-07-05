<script lang="ts">
	import { tranFunc } from '$i18n';
	import { AlertCircle, Icon } from '$lib/components/icons';
	import { Button } from '$lib/components/ui/Button';
	import Modal from './modal.svelte';
	import { type ModalProps } from './types';

	type Props = Omit<ModalProps, 'hideHeader' | 'hideFooter' | 'header' | 'size' | 'onClose'>;

	let {
		children,
		onOk,
		onCancel,
		okText = $tranFunc('common.ok'),
		cancelText = $tranFunc('common.cancel'),
		open
	}: Props = $props();
</script>

<Modal header="" size="xs" hideFooter hideHeader {open}>
	<div class="text-orange-400 flex justify-center py-2">
		<Icon icon={AlertCircle} size="lg" />
	</div>

	<div class="flex justify-center text-center wrap-anywhere">
		{@render children()}
	</div>

	<div class="flex gap-2 justify-center mt-5">
		<Button variant="filled" size="sm" color="red" onclick={onOk}>
			{okText}
		</Button>
		<Button variant="light" size="sm" color="blue" onclick={onCancel}>
			{cancelText}
		</Button>
	</div>
</Modal>
