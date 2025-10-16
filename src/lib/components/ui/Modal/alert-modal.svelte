<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		AlertCircle,
		AlertHexagonFilled,
		Check,
		Icon,
		InforCircle,
		type IconContent,
	} from '$lib/components/icons';
	import { Button } from '$lib/components/ui/Button';
	import type { SocialVariant } from '$lib/utils';
	import Modal from './modal.svelte';
	import { type ModalProps } from './types';

	type Props = Omit<ModalProps, 'hideHeader' | 'hideFooter' | 'header' | 'size' | 'onClose'> & {
		variant?: SocialVariant;
	};

	let {
		children,
		onOk,
		onCancel,
		okText = $tranFunc('common.ok'),
		cancelText = $tranFunc('common.cancel'),
		open,
		variant = 'warning',
	}: Props = $props();

	const VariantMap: Record<SocialVariant, { icon: IconContent; style: string }> = {
		success: {
			icon: Check,
			style: 'text-green-500',
		},
		error: {
			icon: AlertHexagonFilled,
			style: 'text-red-500',
		},
		warning: {
			icon: AlertCircle,
			style: 'text-orange-500',
		},
		info: {
			icon: InforCircle,
			style: 'text-blue-500',
		},
	};
</script>

<Modal header="" size="sm" hideFooter hideHeader {open} closeOnEscape closeOnOutsideClick>
	<div class={`${VariantMap[variant].style} flex justify-center py-2`}>
		<Icon icon={VariantMap[variant].icon} size="lg" />
	</div>

	<div class="flex justify-center text-center">
		{@render children()}
	</div>

	<div class="flex gap-2 justify-center mt-5">
		<Button size="sm" color={['success', 'info'].includes(variant) ? 'blue' : 'red'} onclick={onOk}>
			{okText}
		</Button>
		<Button
			size="sm"
			color={['success', 'info'].includes(variant) ? 'red' : 'blue'}
			onclick={onCancel}
		>
			{cancelText}
		</Button>
	</div>
</Modal>
