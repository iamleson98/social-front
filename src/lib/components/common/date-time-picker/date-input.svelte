<script lang="ts">
	import type { Locale } from './locale';
	import { createFormat } from './parse';

	const defaultDate = new Date();

	type Props = {
		onSelect: (date: Date) => void;
		min?: Date;
		max?: Date;
		id?: string;
		placeholder?: string;
		valid?: boolean;
		disabled?: boolean;
		required?: boolean;
		class: string;
		/** default to `yyyy-MM-dd HH:mm:ss` */
		format?: string;
		locale?: Locale;
	};
	let {
		onSelect,
		min = new Date(defaultDate.getFullYear() - 20, 0, 1),
		max = new Date(defaultDate.getFullYear(), 11, 31, 23, 59, 59, 999),
		id,
		placeholder = '2020-12-31 23:00:00',
		valid = true,
		disabled = false,
		required = false,
		class: className,
		format = 'yyyy-MM-dd HH:mm:ss',
		locale = {}
	}: Props = $props();

	let formatTokens = $derived(createFormat(format, locale));
</script>
