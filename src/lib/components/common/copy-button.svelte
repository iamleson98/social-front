<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Check, ClipboardCopy } from '../icons';
	import { IconButton } from '../ui/Button';
	import type { SocialSize } from '../ui/common';
	import { toast } from 'svelte-sonner';

	type Props = {
		size?: SocialSize;
		copyContent: string;
		class?: string;
    /**
     * @default 'tooltip-right'
     */
		tooltipPlacement?: 'tooltip-top' | 'tooltip-bottom' | 'tooltip-left' | 'tooltip-right';
	};

	let {
		size = 'md',
		copyContent,
		class: className = '',
		tooltipPlacement = 'tooltip-right',
	}: Props = $props();

	const CopyTran = $tranFunc('common.copy');
	const CopiedText = $tranFunc('common.copied');

	let copyTooltip = $state(CopyTran);
	let copyIcon = $state(ClipboardCopy);

	const handleCopy = () => {
		navigator.clipboard
			.writeText(copyContent)
			.then(() => {
				copyTooltip = CopiedText;
				copyIcon = Check;

				setTimeout(() => {
					copyTooltip = CopyTran;
					copyIcon = ClipboardCopy;
				}, 3000);
			})
			.catch((err) => toast.error(err));
	};
</script>

<IconButton
	onclick={handleCopy}
	icon={copyIcon}
	rounded
	class="tooltip {tooltipPlacement} {className}"
	data-tip={copyTooltip}
	{size}
	color="gray"
	variant="light"
/>
