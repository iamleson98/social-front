<script lang="ts">
  export let cardTitle: string;
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
