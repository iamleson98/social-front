<script lang="ts">
	import { PUBLIC_GEOCODER_API_URL } from '$env/static/public';
	import { Icon } from '$lib/components/icons';
	import {
		TablerBus,
		TablerCurrentLocation,
		TablerMapPinFilled,
		TablerPlane,
		TablerSearch,
		TablerTrain,
	} from '$lib/components/icons/consts';
	import { Button } from '$lib/components/ui';
	import { Label } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { States, type GeoResponse } from '$lib/utils/places';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import { Datepicker } from 'flowbite-svelte';
	import toast from 'svelte-french-toast';

	let departureDate = $state<Date | undefined>(undefined);
	let returnDate = $state<Date | undefined>(undefined);

	let pickPlaceSearchKeyword = $state('');
	let dropPlaceSearchKeyword = $state('');

	let states = $state<SelectOption[]>(States);

	const searchPlaces = async (keyword: string) => {
		const params = new URLSearchParams({ q: keyword, limit: '60' });
		const result = await fetch(`${PUBLIC_GEOCODER_API_URL}?${params.toString()}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (result.ok) {
			try {
				const data: GeoResponse = await result.json();
				const options: SelectOption[] = data.features.map((feature) => ({
					label: feature.properties.name,
					value: feature.geometry.coordinates.join(', '), // you can adjust this based on how you want to use the coordinates
				}));
				return options;
			} catch (error) {
				toast.error('Failed to parse places data');
				return [];
			}
		} else {
			toast.error('Failed to search places');
			return [];
		}
	};

	const PickPlaceQuery = createQuery(() => ({
		enabled: !!pickPlaceSearchKeyword,
		queryKey: ['test-query', pickPlaceSearchKeyword],
		queryFn: async () => {
			const data = await searchPlaces(pickPlaceSearchKeyword);
			states = data;
		},
	}));
</script>

<div
	class="h-screen w-full bg-cover bg-center bg-no-repeat rounded-lg"
	style="background-image: url('/hero-bg.jpg');"
>
	<div class="h-full bg-black/60 py-20 px-10">
		<div class="mb-20 text-white">
			<h1 class="text-2xl md:text-6xl font-bold mb-2">
				Mỗi một chuyến đi là một trải nghiệm thú vị
			</h1>
			<p class="mb-8 font-medium text-white/80 text-xl">
				Chúng tôi luôn không ngừng nỗ lực để đem tới cho quý khách hàng những sản phẩm chất lượng
				nhất
			</p>
		</div>

		<div class={SitenameCommonClassName}>
			<div>
				<div role="tablist" class="tabs tabs-lift">
					<span role="tab" class="tab tab-active">
						<div class="flex items-center gap-2">
							<Icon icon={TablerBus} size="md" />
							<span>Xe Khách</span>
						</div>
					</span>
					<span role="tab" class="tab">
						<div class="flex items-center gap-2">
							<Icon icon={TablerTrain} size="md" />
							<span>Tàu</span>
						</div>
					</span>
					<span role="tab" class="tab">
						<div class="flex items-center gap-2">
							<Icon icon={TablerPlane} size="md" />
							<span>Máy Bay</span>
						</div>
					</span>
				</div>
			</div>
			<div class="flex items-end gap-2">
				<div class="grid grid-cols-4 gap-3">
					<Select
						label="Điểm Đón"
						startIcon={TablerCurrentLocation}
						startIconClass="text-blue-500"
						placeholder="Nhập điểm đón"
						size="md"
						required
						options={states}
						inputDebounceOption={{
							debounceTime: 888,
							onInput: (evt) => (pickPlaceSearchKeyword = (evt.target as HTMLInputElement).value),
						}}
						showLoadingMore={PickPlaceQuery.isFetching}
					/>
					<Select
						label="Điểm Đến"
						startIcon={TablerMapPinFilled}
						startIconClass="text-red-500"
						placeholder="Nhập điểm đến"
						size="md"
						required
						options={states}
						inputDebounceOption={{
							debounceTime: 888,
							onInput: (evt) => (dropPlaceSearchKeyword = (evt.target as HTMLInputElement).value),
						}}
						// showLoadingMore={DropPlaceQuery.isFetching}
					/>
					<div>
						<Label label="Chọn Ngày Đi" size="md" variant="info" required requiredAtPos="end" />
						<Datepicker bind:value={departureDate} />
					</div>

					<div>
						<Label label="Chọn Ngày Về" size="md" variant="info" />
						<Datepicker bind:value={returnDate} />
					</div>
				</div>

				<Button startIcon={TablerSearch} size="md">Tìm Kiếm</Button>
			</div>
		</div>
	</div>
</div>
