<script lang="ts">
	import { T } from '$i18n';
	import { Check, ClipboardCopy } from '../icons';
	import { IconButton } from '../ui/Button';
	import type { SocialColor, SocialSize } from '../ui/common';
	import toast from 'svelte-french-toast';

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

	const CopyTran = $T('common.copy');
	const CopiedText = $T('common.copied');

	let copyTooltip = $state(CopyTran);
	let copyIcon = $state(ClipboardCopy);
	let copyColor = $state<SocialColor>('gray');

	const handleCopy = () => {
		if (copyTooltip === CopiedText) return;

		navigator.clipboard
			.writeText(copyContent)
			.then(() => {
				copyTooltip = CopiedText;
				copyIcon = Check;
				copyColor = 'green';

				setTimeout(() => {
					copyTooltip = CopyTran;
					copyIcon = ClipboardCopy;
					copyColor = 'gray';
				}, 3000);
			})
			.catch((err) => {
				toast.error(err);
			});
	};
</script>

<IconButton
	onclick={handleCopy}
	icon={copyIcon}
	rounded
	class="tooltip {tooltipPlacement} {className}"
	data-tip={copyTooltip}
	{size}
	color={copyColor}
	variant="light"
/>
