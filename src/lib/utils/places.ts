export type State = {
	label: string;
	/** lat, long format */
	value: string;
};

/** List of old 63 cities/provinces of Vietnam */
export const States: State[] = [
	{
		label: 'Hà Nội',
		value: '21.0285, 105.8542',
	},
	{
		label: 'Hồ Chí Minh',
		value: '10.7769, 106.7009',
	},
	{
		label: 'Đà Nẵng',
		value: '16.0544, 108.2022',
	},
	{
		label: 'Hải Phòng',
		value: '20.8449, 106.6881',
	},
	{
		label: 'Cần Thơ',
		value: '10.0452, 105.7469',
	},
	{
		label: 'An Giang',
		value: '10.5231, 105.1368',
	},
	{
		label: 'Bà Rịa - Vũng Tàu',
		value: '10.4114, 107.1362',
	},
	{
		label: 'Bắc Giang',
		value: '21.2711, 106.1959',
	},
	{
		label: 'Bắc Kạn',
		value: '22.1492, 105.8368',
	},
	{
		label: 'Bạc Liêu',
		value: '9.2878, 105.7281',
	},
	{
		label: 'Bắc Ninh',
		value: '21.15, 106.05',
	},
	{
		label: 'Bến Tre',
		value: '10.2361, 106.373',
	},
	{
		label: 'Bình Định',
		value: '13.7821, 109.2191',
	},
	{
		label: 'Bình Dương',
		value: '11.9466, 106.7568',
	},
	{
		label: 'Bình Phước',
		value: '11.8037, 106.7998',
	},
	{
		label: 'Bình Thuận',
		value: '11.04, 108.08',
	},
	{
		label: 'Cà Mau',
		value: '9.1765, 105.1538',
	},
	{
		label: 'Cao Bằng',
		value: '22.6688, 106.0438',
	},
	{
		label: 'Đắk Lắk',
		value: '12.6745, 108.05',
	},
	{
		label: 'Đắk Nông',
		value: '12.25, 107.5',
	},
	{
		label: 'Điện Biên',
		value: '21.38, 103.02',
	},
	{
		label: 'Đồng Nai',
		value: '10.8, 106.7',
	},
	{
		label: 'Đồng Tháp',
		value: '10.65, 105.6',
	},
	{
		label: 'Gia Lai',
		value: '13.5833, 108.0',
	},
	{
		label: 'Hà Giang',
		value: '22.7833, 104.9833',
	},
	{
		label: 'Hà Nam',
		value: '20.5833, 105.9167',
	},
	{
		label: 'Hà Tĩnh',
		value: '18.3333, 105.9',
	},
	{
		label: 'Hải Dương',
		value: '20.9333, 106.3333',
	},
	{
		label: 'Hậu Giang',
		value: '9.7833, 105.5',
	},
	{
		label: 'Hòa Bình',
		value: '20.8167, 105.3333',
	},
	{
		label: 'Hưng Yên',
		value: '20.85, 106.0',
	},
	{
		label: 'Khánh Hòa',
		value: '12.25, 109.2',
	},
	{
		label: 'Kiên Giang',
		value: '10.0, 105.0',
	},
	{
		label: 'Kon Tum',
		value: '14.35, 107.8',
	},
	{
		label: 'Lai Châu',
		value: '22.3833, 103.3',
	},
	{
		label: 'Lâm Đồng',
		value: '11.5833, 108.0',
	},
	{
		label: 'Lạng Sơn',
		value: '21.85, 106.75',
	},
	{
		label: 'Lào Cai',
		value: '22.3333, 103.9',
	},
	{
		label: 'Long An',
		value: '10.5333, 106.4167',
	},
	{
		label: 'Nam Định',
		value: '20.4167, 106.1667',
	},
	{
		label: 'Nghệ An',
		value: '19.5, 105.6667',
	},
	{
		label: 'Ninh Bình',
		value: '20.25, 105.9667',
	},
	{
		label: 'Ninh Thuận',
		value: '11.75, 108.25',
	},
	{
		label: 'Phú Thọ',
		value: '21.3333, 105.0',
	},
	{
		label: 'Phú Yên',
		value: '13.0833, 109.3',
	},
	{
		label: 'Quảng Bình',
		value: '17.5, 106.25',
	},
	{
		label: 'Quảng Nam',
		value: '15.5833, 108.0',
	},
	{
		label: 'Quảng Ngãi',
		value: '15.0, 108.75',
	},
	{
		label: 'Quảng Ninh',
		value: '21.0, 107.0',
	},
	{
		label: 'Quảng Trị',
		value: '16.75, 107.0',
	},
	{
		label: 'Sóc Trăng',
		value: '9.6, 105.9667',
	},
	{
		label: 'Sơn La',
		value: '21.3333, 103.9',
	},
	{
		label: 'Tây Ninh',
		value: '11.3333, 106.1',
	},
	{
		label: 'Thái Bình',
		value: '20.4167, 106.3333',
	},
	{
		label: 'Thái Nguyên',
		value: '21.6, 105.85',
	},
	{
		label: 'Thanh Hóa',
		value: '19.8, 105.8',
	},
	{
		label: 'Thừa Thiên Huế',
		value: '16.4667, 107.6',
	},
	{
		label: 'Tiền Giang',
		value: '10.4167, 106.25',
	},
	{
		label: 'Trà Vinh',
		value: '9.75, 106.25',
	},
	{
		label: 'Tuyên Quang',
		value: '22.0, 105.0',
	},
	{
		label: 'Vĩnh Long',
		value: '10.25, 105.9667',
	},
	{
		label: 'Vĩnh Phúc',
		value: '21.3, 105.6',
	},
	{
		label: 'Yên Bái',
		value: '21.7, 104.9',
	},
];

export type GeoResponseItem = {
	geometry: {
		coordinates: [number, number];
		type: string;
	};
	properties: {
		importance: number;
		name: string;
		osm_id: number;
		osm_key: string;
		osm_type: string;
		osm_value: string;
		type: string;
	};
	type: string;
};

export type GeoResponse = {
	features: GeoResponseItem[];
	license: string;
	type: string;
};
