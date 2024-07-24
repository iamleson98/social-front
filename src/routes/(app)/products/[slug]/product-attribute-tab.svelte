<script lang="ts">
  import { type SelectedAttribute, AttributeInputTypeEnum } from '$lib/gql/graphql'
  import { formatSelectedAttributeValue } from '$lib/utils/utils';

  export let selectedAttributes: SelectedAttribute[] = [];
</script>

<div>
  {#each selectedAttributes as selectedAttribute}
    <div class="flex items-center mb-2 text-sm text-gray-500">
      <div class="w-1/6 font-normal">
        <!-- {selectedAttribute} -->
        {selectedAttribute.attribute.name}
      </div>
      <div class="font-semibold">
        {formatSelectedAttributeValue(selectedAttribute)}
      </div>
    </div>
  {/each}
</div>
