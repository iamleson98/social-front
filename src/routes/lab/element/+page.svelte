<script lang="ts">
	import Comment from '$lib/components/common/comment/Comment.svelte';
	import Dropdown from '$lib/components/ui/Dropdown/dropdown/Dropdown.svelte';
	import Menu from '$lib/components/ui/Dropdown/menu/Menu.svelte';
	import MenuButton from '$lib/components/ui/Dropdown/menu/MenuButton.svelte';
	import MenuItem from '$lib/components/ui/Dropdown/menu/MenuItem.svelte';

	let open = $state(false);

	function handleSelect(option: string) {
		alert(`Selected: ${option}`);
		open = false;
	}

	function toggleDropdown() {
		open = !open;
	}
</script>

<div>
	<Comment customerName="AAA" feedBack="good" rating={4} createAt="22/12/2024" />
	<Comment customerName="AAA" feedBack="good" rating={5} createAt="22/12/2024" />
	<Comment customerName="AAA" feedBack="good" rating={1} createAt="22/12/2024" />
</div>

<Dropdown>
	<MenuButton onClick={toggleDropdown}>Action</MenuButton>
	<Menu {open}>
		<MenuItem onClick={() => handleSelect('Option 1')}>Back to Login page</MenuItem>
		<MenuItem onClick={() => handleSelect('Option 2')}>Navigstion to Cart page</MenuItem>
		<MenuItem onClick={() => handleSelect('Option 3')}>Quit</MenuItem>
	</Menu>
</Dropdown>
