<script lang="ts">
	import { spring } from 'svelte/motion';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons';

	let count = 0;

	const displayed_count = spring();
	$: displayed_count.set(count);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}
</script>

<ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
	<li>
		<div class="timeline-middle">
			<!-- <svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
				><path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/></svg
			> -->
			<FontAwesomeIcon icon={faCheck} />
		</div>
		<div class="timeline-start md:text-end mb-10">
			<time class="font-mono italic">1984</time>
			<div class="text-lg font-black">First Macintosh computer</div>
			The Apple Macintosh—later rebranded as the Macintosh 128K—is the original Apple Macintosh personal
			computer. It played a pivotal role in establishing desktop publishing as a general office function.
			The motherboard, a 9 in (23 cm) CRT monitor, and a floppy drive were housed in a beige case with
			integrated carrying handle; it came with a keyboard and single-button mouse.
		</div>
		<hr />
	</li>
	<li>
		<hr />
		<div class="timeline-middle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
				><path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/></svg
			>
		</div>
		<div class="timeline-end mb-10">
			<time class="font-mono italic">1998</time>
			<div class="text-lg font-black">iMac</div>
			iMac is a family of all-in-one Mac desktop computers designed and built by Apple Inc. It has been
			the primary part of Apple's consumer desktop offerings since its debut in August 1998, and has
			evolved through seven distinct forms
		</div>
		<hr />
	</li>
	<li>
		<hr />
		<div class="timeline-middle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
				><path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/></svg
			>
		</div>
		<div class="timeline-start md:text-end mb-10">
			<time class="font-mono italic">2001</time>
			<div class="text-lg font-black">iPod</div>
			The iPod is a discontinued series of portable media players and multi-purpose mobile devices designed
			and marketed by Apple Inc. The first version was released on October 23, 2001, about 8+1⁄2 months
			after the Macintosh version of iTunes was released. Apple sold an estimated 450 million iPod products
			as of 2022. Apple discontinued the iPod product line on May 10, 2022. At over 20 years, the iPod
			brand is the oldest to be discontinued by Apple
		</div>
		<hr />
	</li>
	<li>
		<hr />
		<div class="timeline-middle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
				><path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/></svg
			>
		</div>
		<div class="timeline-end mb-10">
			<time class="font-mono italic">2007</time>
			<div class="text-lg font-black">iPhone</div>
			iPhone is a line of smartphones produced by Apple Inc. that use Apple's own iOS mobile operating
			system. The first-generation iPhone was announced by then-Apple CEO Steve Jobs on January 9, 2007.
			Since then, Apple has annually released new iPhone models and iOS updates. As of November 1, 2018,
			more than 2.2 billion iPhones had been sold. As of 2022, the iPhone accounts for 15.6% of global
			smartphone market share
		</div>
		<hr />
	</li>
	<li>
		<hr />
		<div class="timeline-middle">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="h-5 w-5"
				><path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/></svg
			>
		</div>
		<div class="timeline-start md:text-end mb-10">
			<time class="font-mono italic">2015</time>
			<div class="text-lg font-black">Apple Watch</div>
			The Apple Watch is a line of smartwatches produced by Apple Inc. It incorporates fitness tracking,
			health-oriented capabilities, and wireless telecommunication, and integrates with iOS and other
			Apple products and services
		</div>
	</li>
</ul>

<div class="counter">
	<!-- <button on:click={() => (count -= 1)} aria-label="Decrease the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5" />
		</svg>
	</button> -->
	<button class="btn btn-square btn-sm">
		<FontAwesomeIcon icon={faPen} />
	</button>

	<div class="counter-viewport">
		<div class="counter-digits" style="transform: translate(0, {100 * offset}%)">
			<strong class="hidden" aria-hidden="true">{Math.floor($displayed_count + 1)}</strong>
			<strong>{Math.floor($displayed_count)}</strong>
		</div>
	</div>

	<button on:click={() => (count += 1)} aria-label="Increase the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5 M0.5,0 L0.5,1" />
		</svg>
	</button>
</div>

<style>
	.counter {
		display: flex;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin: 1rem 0;
	}

	.counter button {
		width: 2em;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background-color: transparent;
		touch-action: manipulation;
		font-size: 2rem;
	}

	.counter button:hover {
		background-color: var(--color-bg-1);
	}

	svg {
		width: 25%;
		height: 25%;
	}

	path {
		vector-effect: non-scaling-stroke;
		stroke-width: 2px;
		stroke: #444;
	}

	.counter-viewport {
		width: 8em;
		height: 4em;
		overflow: hidden;
		text-align: center;
		position: relative;
	}

	.counter-viewport strong {
		position: absolute;
		display: flex;
		width: 100%;
		height: 100%;
		font-weight: 400;
		color: var(--color-theme-1);
		font-size: 4rem;
		align-items: center;
		justify-content: center;
	}

	.counter-digits {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	.hidden {
		top: -100%;
		user-select: none;
	}
</style>
