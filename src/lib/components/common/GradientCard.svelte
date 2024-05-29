<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let icon: string;
    export let name: string;
    export let bgFrom: string = 'from-pink-500';
    export let bgTo: string = 'to-red-500';
    export let selected: boolean = false;
    export let displayMode: string;

    const dispatch = createEventDispatcher();
</script>

<div
    class="{`flex items-center p-4 rounded-lg bg-f3f4f6 cursor-pointer h-[130px] ${displayMode === 'column' ? 'w-full' : 'w-[280px]'}`}"
    on:click={() => dispatch('click')}
>
    <div
        class={`flex items-center justify-center h-20 w-20 rounded-lg bg-gradient-to-br ${bgFrom} ${bgTo}`}
    >
        <slot name="icon"></slot>
    </div>
    <div class="ml-4 flex-1">
        <span class="text-[18px] font-lobster text-FF7715CC">{name}</span>
    </div>
    {#if selected}
        <span class="icon-[system-uicons--check-circle] w-[24px] h-[24px] bg-blue-500 text-white"
        ></span>
    {/if}
</div>
