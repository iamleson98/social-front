<script lang="ts">
	type Props = {
		isCreatePage?: boolean;
		maximumOrderWeight: number;
		minimumOrderWeight: number;
	};

	const {
		isCreatePage,
		maximumOrderWeight = $bindable(),
		minimumOrderWeight = $bindable(),
	}: Props = $props();
</script>

{void minimumOrderWeight}
{void maximumOrderWeight}
{void isCreatePage}
