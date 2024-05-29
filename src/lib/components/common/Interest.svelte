<script lang="ts">
    import GradientCard from './GradientCard.svelte';

    interface Interest {
        id: number;
        name: string;
        icon: string;
        selected: boolean;
        bgFrom: string;
        bgTo: string;
    }

    let interests: Interest[] = [
        {
            id: 1,
            name: 'Sport & Travel',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-ffc9cf',
            bgTo: 'to-b40e24'
        },
        {
            id: 2,
            name: 'Books',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-ffaace',
            bgTo: 'to-78035e'
        },
        {
            id: 3,
            name: 'Men fashion',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-ffc48d',
            bgTo: 'to-68046a'
        },
        {
            id: 4,
            name: 'Women handbag',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-fff599',
            bgTo: 'to-1475ab'
        },
        {
            id: 5,
            name: 'Men fashion',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-ffc48d',
            bgTo: 'to-68046a'
        },
        {
            id: 6,
            name: 'Women handbag',
            icon: 'icon-[system-uicons--button-minus]',
            selected: false,
            bgFrom: 'from-fff599',
            bgTo: 'to-1475ab'
        }
    ];

    export let displayMode: string = 'grid'; // Default display mode is grid

    function toggleSelection(id: number) {
        interests = interests.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
        );
    }
</script>

<div>
    <div class="{displayMode === 'grid' ? 'grid grid-cols-2 gap-2 w-full pl-3 pr-[30px] h-[420px] overflow-y-auto' : 'flex flex-col w-full pl-3 gap-3 pr-[30px] h-[420px] overflow-y-auto'}">
        {#each interests as { id, name, icon, selected, bgFrom, bgTo }}
            <GradientCard {icon} {name} {bgFrom} {bgTo} {selected} displayMode={displayMode} on:click={() => toggleSelection(id)}>
                <span slot="icon" class={icon} style="color: #fff; width: 51px; height:51px"></span>
            </GradientCard>
        {/each}
    </div>
    
    <div class="flex justify-end mt-10 mr-5">
        <button class="px-4 py-1 mr-2 font-bold bg-fee2e2 text-ef4444 rounded">Cancel</button>
        <button class="px-4 py-1 font-bold bg-eff6ff text-3b82f6 rounded">Save</button>
    </div>
</div>
