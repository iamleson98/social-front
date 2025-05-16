<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { SocialSize } from '../common';
	import { INPUT_BUTTON_SIZE_MAP, type ButtonProps } from './button.types';

	type Props = Pick<ButtonProps, 'size' | 'fullWidth'>;

	let { size = 'md', fullWidth = false }: Props = $props();

	const sizeStyles: Record<SocialSize, string> = {
		'xl': 'w-22',
		'lg': 'w-18',
		'md': 'w-14',
		'sm': 'w-10',
		'xs': 'w-8',
	};
</script>

<SkeletonContainer>
	<Skeleton
		class="{INPUT_BUTTON_SIZE_MAP[size]} {sizeStyles[size]} {fullWidth ? 'w-full' : ''}"
		rounded={false}
	/>
</SkeletonContainer>
