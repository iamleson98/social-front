<script lang="ts">
	let text = $state('hi');

	export const control = (msg: string) => {
		text = msg;
	};
</script>

<div>{text}</div>
