<script lang="ts">
	import { Accordion } from "$lib/components/ui/Accordion";
	import { Input } from "$lib/components/ui/Input";

	type Props = {
		slug?: string;
		seo: {
			title?: string;
			description?: string;
		};
	};

	let { slug = $bindable(), seo = $bindable() }: Props = $props();
</script>

<div class="bg-white rounded-lg border w-full border-gray-200">
	<Accordion header="Search engine preview" open={false}>
    <Input
      label="Slug"
      bind:value={slug}
    />
		<Input
			label="Title"
			bind:value={seo.title}
      placeholder="Search Engine Title"
			class="my-2"
		/>
		<Input
			label="Description"
			bind:value={seo.description}
      placeholder="Search Engine Description"
			class="pb-2"
		/>
	</Accordion>
</div>
