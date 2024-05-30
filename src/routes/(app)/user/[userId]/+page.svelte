<script lang="ts">
	import Interest from "$lib/components/common/Interest.svelte";

	let urlBg = 'https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg';
	let urlAvatar = 'https://buffer.com/library/content/images/2023/10/free-images.jpg';

	let displayMode: 'grid' | 'column' = 'grid';

	function toggleDisplayMode(mode: 'grid' | 'column') {
		displayMode = mode;
	}
</script>

<svelte:head>
	<title>User Id</title>
</svelte:head>

<div class="w-full pt-10 bg-gray-100 pb-5">
	<div class="w-full max-w-6xl mx-auto">
		<div class="relative w-full h-64 rounded bg-cover" style="background-image: url({urlBg});">
			<div class="flex flex-row items-center translate-y-1/2 pl-20">
				<div class="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white">
					<img src={urlAvatar} alt="Avatar" class="w-full h-full object-cover" />
					<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
						<span class="icon-[system-uicons--camera] text-white text-xl"></span>
						<button>Update</button>
					</div>
				</div>
				<p class="text-white text-xl font-bold ml-5 mt-10">nguyen van phuc shop</p>
			</div>
		</div>

		<div class="flex mt-5 w-full justify-between">
			<div class="bg-white rounded w-1/3 mr-5 h-96 p-5">
				<p class="text-custom-text-color text-lg">About us</p>
				<p class="text-sm p-1 mt-3 text-center w-full h-30 py-5 mx-auto border-2 border-blue-300 rounded flex justify-center items-center">
					We sell product to people <br>
					And gain back the truth from them
				</p>

				<button class="w-80 h-10 bg-gray-200 rounded block mx-auto mt-5 mb-2 font-bold">
					Edit Slogan
				</button>
				<button class="w-80 h-10 bg-blue-500 text-white rounded block mx-auto mb-5 font-bold">
					Follow
				</button>

				<div class="flex flex-row w-60 ml-3 mb-3 items-center">
					<span class="icon-[system-uicons--check-circle-outside] mr-2 w-4 h-4" style="color: #718096;"></span>
					<p class="text-custom-text-color">verified seller</p>
				</div>

				<div class="flex flex-row w-60 ml-3 mb-3 items-center">
					<span class="icon-[system-uicons--clock] mr-2 w-4 h-4" style="color: #718096;"></span>
					<p class="text-custom-text-color">Joined July 2013</p>
				</div>

				<div class="flex flex-row w-60 ml-3 mb-3 items-center">
					<span class="icon-[system-uicons--tag] mr-2 w-4 h-4" style="color: #718096;"></span>
					<p class="text-custom-text-color">Joined July 2013</p>
				</div>
				
			</div>
			<div class="bg-white rounded w-2/3 h-97 pl-10 pr-10 pt-5 pb-5">
				<div class="h-5 flex items-center gap-10 pl-3">
					<button>Interests</button>
					<button>Following</button>
					<button>Followers</button>
				</div>
				<div class="w-full h-7 flex pr-5 mt-1 mb-1">
					<span on:click={() => toggleDisplayMode('column')} class="icon-[system-uicons--document-list] ml-auto w-5 h-5" style="color: #718096; cursor: pointer;"></span>
					<span on:click={() => toggleDisplayMode('grid')} class="icon-[system-uicons--calendar-split] w-5 h-5" style="color: #718096; cursor: pointer;"></span>
				</div>
				
				<Interest {displayMode}/>
			</div>
		</div>
	</div>
</div>
