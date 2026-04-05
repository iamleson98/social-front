export type BookingAddress = {
	id: string;
	createat: number;
	updateat: number;
	firstname?: string | null;
	lastname?: string | null;
	company_name?: string | null;
	street_address_1?: string | null;
	street_address_2?: string | null;
	city?: string | null;
	country?: string | null;
	postal_code?: string | null;
	phone?: string | null;
};

export type BookingRoute = {
	id: string;
	createat: number;
	updateat: number;
	deleteat?: number | null;
	name: string;
	pickup_address_id: string;
	destination_address_id: string;
};

export type BookingTransportBrand = {
	id: string;
	createat?: number;
	updateat?: number;
	deleteat?: number;
	name: string;
	description?: string;
	email: string;
	phone: string;
	vehicle_types?: string;
	representor_id: string;
	address_id?: string;
};

export type BookingVehicle = {
	id: string;
	createat: number;
	updateat: number;
	deleteat?: number | null;
	name?: string | null;
	note?: string | null;
	maker: string;
	license_plate: string;
	verified_at?: number | null;
	type: string;
	phone?: string | null;
	driver_id: string;
	driver_supporter_id?: string | null;
	supervisor_id?: string | null;
	total_seats_available: number;
};

export type BookingSeat = {
	id: string;
	number: number;
	vehicle_id: string;
	createat: number;
	updateat: number;
	deleteat?: number | null;
	price: number | string;
};

export type BookingTrip = {
	id: string;
	route_id: string;
	vehicle_id: string;
	start_at: number;
	end_at?: number | null;
	status: string;
	fail_reason?: string | null;
};

export type BookingReservation = {
	id: string;
	trip_id: string;
	user_id: string;
	seat_id: string;
	createat: number;
	updateat: number;
	deleteat?: number | null;
	cancel_at?: number | null;
	cancel_reason?: string | null;
	status?: string | null;
	reservation_placement_confirmed_at?: number | null;
	reservation_placement_confirmed_by?: string | null;
	trip_finish_confirmed_at?: number | null;
	trip_finish_confirmed_by?: string | null;
	user_satisfaction_score?: number | null;
	user_satisfaction_note?: string | null;
};

export type CancelBookingReservationRequest = {
	reason: string;
};

export type FailBookingTripRequest = {
	reason: string;
};
