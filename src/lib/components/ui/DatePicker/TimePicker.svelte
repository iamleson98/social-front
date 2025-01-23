<script lang="ts">
	type Props = {
		browseDate: Date;
		timePrecision?: 'minute' | 'second' | 'millisecond';
		setTime: (d: Date) => Date;
	};

	type SpanEvent = { currentTarget: EventTarget & HTMLSpanElement };

	let { browseDate, timePrecision, setTime }: Props = $props();

	let fields: (HTMLSpanElement | undefined | null)[] = [];

	function select(node: Node) {
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(node);
		selection?.removeAllRanges();
		selection?.addRange(range);
	}

	function keydown(e: KeyboardEvent & SpanEvent) {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			const value = get_value(e.currentTarget);
			const delta = e.key === 'ArrowUp' ? 1 : -1;
			set_value(e.currentTarget, value + delta, true);
			e.preventDefault();
			select(e.currentTarget);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || ':;-,.'.includes(e.key)) {
			const field_index = fields.indexOf(e.currentTarget);
			const delta = e.key === 'ArrowLeft' ? -1 : 1;
			const el = fields[field_index + delta];
			e.preventDefault();
			if (el) {
				el.focus();
				select(el);
			}
		}
	}

	function get_value(node: HTMLElement) {
		const label = get_field(node).label;
		if (label === 'Hours') {
			return browseDate.getHours();
		} else if (label === 'Minutes') {
			return browseDate.getMinutes();
		} else if (label === 'Seconds') {
			return browseDate.getSeconds();
		} else {
			return browseDate.getMilliseconds();
		}
	}

	function clamp(value: number, max: number, loop_around: boolean) {
		if (loop_around && value < 0) {
			return max;
		} else if (loop_around && value > max) {
			return 0;
		} else {
			return Math.max(0, Math.min(max, value));
		}
	}

	function get_field(element: HTMLElement) {
		const label = element.getAttribute('aria-label');
		if (label === 'Hours') {
			return { label, len: 2, max: 23 } as const;
		} else if (label === 'Minutes') {
			return { label, len: 2, max: 59 } as const;
		} else if (label === 'Seconds') {
			return { label, len: 2, max: 59 } as const;
		} else if (label === 'Milliseconds') {
			return { label, len: 3, max: 999 } as const;
		} else {
			throw new Error('Invalid label ' + label);
		}
	}

	function setText(d: Date) {
		const hours = ('00' + d.getHours()).slice(-2);
		const minutes = ('00' + d.getMinutes()).slice(-2);
		const seconds = ('00' + d.getSeconds()).slice(-2);
		const milliseconds = ('000' + d.getMilliseconds()).slice(-3);
		if (fields[0] && fields[0].innerText !== hours) {
			fields[0].innerText = hours;
		}
		if (fields[1] && fields[1].innerText !== minutes) {
			fields[1].innerText = minutes;
		}
		if (fields[2] && fields[2].innerText !== seconds) {
			fields[2].innerText = seconds;
		}
		if (fields[3] && fields[3].innerText !== milliseconds) {
			fields[3].innerText = milliseconds;
		}
	}

	$effect(() => {
		if (browseDate) setText(browseDate);
	});

	function set_value(node: HTMLElement, value: number, loop_around = false) {
		const field = get_field(node);
		value = clamp(value, field.max, loop_around);
		if (field.label === 'Hours') {
			browseDate.setHours(value);
		} else if (field.label === 'Minutes') {
			browseDate.setMinutes(value);
		} else if (field.label === 'Seconds') {
			browseDate.setSeconds(value);
		} else if (field.label === 'Milliseconds') {
			browseDate.setMilliseconds(value);
		}

		browseDate = setTime(browseDate);
		setText(browseDate);
	}

	function parse(text: string, length: number) {
		return parseInt(text.replace(/[^\d]/g, '').slice(-length));
	}

	function input(e_unknown: unknown) {
		const e = e_unknown as InputEvent & SpanEvent; // type error workaround

		const field = get_field(e.currentTarget);
		let new_value: number;

		if (e.inputType === 'insertText') {
			const original_text = '000' + get_value(e.currentTarget);
			new_value = parse(original_text + e.currentTarget.innerText, field.len);
			if (new_value > field.max && e.data) {
				new_value = parse(e.data, field.len);
			}
		} else {
			new_value = parse('000' + e.currentTarget.innerText, field.len);
		}

		set_value(e.currentTarget, new_value);
		select(e.currentTarget);
	}

	function focus(e: FocusEvent & SpanEvent) {
		select(e.currentTarget);
	}
</script>

{#if timePrecision}
	<div
		role="none"
		onmousedown={(e) => {
			if (e.target instanceof HTMLElement && e.target.tagName === 'SPAN') {
				e.target.focus();
				e.preventDefault(); // prevent text dragging
			}
		}}
		class="text-base flex items-center w-fit border border-gray-200 rounded-sm m-auto mt-1.5 tabular-nums"
	>
		<span
			bind:this={fields[0]}
			role="spinbutton"
			aria-label="Hours"
			tabindex="0"
			contenteditable
			inputmode="numeric"
			onkeydown={keydown}
			oninput={input}
			onfocus={focus}
		>
			{('00' + browseDate.getHours()).slice(-2)}
		</span>:
		<span
			bind:this={fields[1]}
			role="spinbutton"
			aria-label="Minutes"
			tabindex="0"
			contenteditable
			inputmode="numeric"
			onkeydown={keydown}
			oninput={input}
			onfocus={focus}>{('00' + browseDate.getMinutes()).slice(-2)}</span
		>
		{#if timePrecision !== 'minute'}
			:<span
				bind:this={fields[2]}
				role="spinbutton"
				aria-label="Seconds"
				tabindex="0"
				contenteditable
				inputmode="numeric"
				onkeydown={keydown}
				oninput={input}
				onfocus={focus}>{('00' + browseDate.getSeconds()).slice(-2)}</span
			>
			{#if timePrecision !== 'second'}
				.<span
					bind:this={fields[3]}
					role="spinbutton"
					aria-label="Milliseconds"
					tabindex="0"
					contenteditable
					inputmode="numeric"
					onkeydown={keydown}
					oninput={input}
					onfocus={focus}>{('000' + browseDate.getMilliseconds()).slice(-3)}</span
				>
			{/if}
		{/if}
	</div>
{/if}

<style>
	@import 'tailwindcss/theme';

	span {
		@apply select-all outline-none relative z-1 py-1 px-0 first:pl-1.5 last:pr-1.5 not-focus:selection:bg-transparent;
	}
</style>
