<script lang="ts">
	let text = $state('hi');

	/** tell me to say something you want */
	export const control = (msg: string) => {
		text = msg;
	};
</script>

<div>{text}</div>
