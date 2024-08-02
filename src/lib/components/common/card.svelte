<script lang="ts">
  interface Props {
    cardTitle: string;
  }

  let { cardTitle }: Props = $props();
</script>

<div class="card">
  <div class="card-body">
    <div class="card-title">
      {cardTitle}
    </div>
    <div>
      <slot />
    </div>
  </div>
</div>
