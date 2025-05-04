<script lang="ts">
	import { Popover } from '../Popover';
	import type { DropdownProps } from './types';

	let { trigger, children }: DropdownProps = $props();
</script>

<Popover {trigger} placement="bottom">
	<!-- <div slot="trigger">Dropdown</div>
	<div slot="options">Options</div> -->
	<div></div>
</Popover>
