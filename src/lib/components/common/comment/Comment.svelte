<script lang="ts" module>
	export type Props = {
		avatar?: string;
		customerName?: String;
		feedBack?: String;
		rating?: number;
		image?: String[];
		video?: String[];
		createAt?: String;
	};
</script>

<script lang="ts">
	import Rating from '../../ui/rating/Rating.svelte';

	let {
		avatar = 'https://cly.1cdn.vn/2022/05/10/anh-nen-avatar-dep_021652403.jpg',
		customerName,
		feedBack,
		rating = 0,
		image = [],
		video = [],
		createAt
	}: Props = $props();
</script>

<div class="border border-gray-200 p-4 rounded-lg bg-white my-2">
	<div class="flex">
		<img src={avatar} alt={avatar} class="w-10 h-10 rounded-full object-cover" />
		<div class="flex-grow">
			<span class="px-3 text-lg text-gray-600 font-bold">{customerName}</span>
			<span class="px-3 text-gray-400 text-[10px] block">{createAt}</span>
		</div>
		<Rating {rating} />
	</div>
	<div class="pt-3 text-sm text-gray-500">
		<span>{feedBack}</span>
	</div>
</div>
