import { OrderDirection } from '$lib/gql/graphql';
import { SearchParamKey } from './consts';
import { formatMoney, flipDirection, parseUrlSearchParams } from './utils';
import { describe, expect, it } from 'vitest';

describe('formatMoney', () => {
	it('formats a single amount with the currency symbol', () => {
		expect(formatMoney('USD', 12.5)).toContain('$12.50');
	});

	it('formats a range when end amount is provided', () => {
		const result = formatMoney('USD', 10, 20);
		expect(result).toContain('$10.00');
		expect(result).toContain('$20.00');
	});
});

describe('flipDirection', () => {
	it('flips asc to desc and back', () => {
		expect(flipDirection(OrderDirection.Asc)).toBe(OrderDirection.Desc);
		expect(flipDirection(OrderDirection.Desc)).toBe(OrderDirection.Asc);
	});
});

describe('parseUrlSearchParams', () => {
	it('parses numbers into eq values', () => {
		const url = new URL('https://shop.example.com/?first=10');
		const params = parseUrlSearchParams(url);

		expect(params[SearchParamKey.FIRST as never]).toEqual({
			operator: 'eq',
			value: 10,
		});
	});

	it('parses booleans into eq values', () => {
		const url = new URL('https://shop.example.com/?isPublished=true');
		const params = parseUrlSearchParams<{ isPublished: never }>(url);

		expect(params.isPublished?.value).toBe(true);
	});

	it('parses plain strings into eq values', () => {
		const url = new URL('https://shop.example.com/?search=iphone');
		const params = parseUrlSearchParams<{ search: never }>(url);

		expect(params.search).toEqual({ operator: 'eq', value: 'iphone' });
	});

	it('parses price ranges in <gte,lte> form', () => {
		const url = new URL('https://shop.example.com/?price-range=%3C10%2C20%3E');
		const params = parseUrlSearchParams<{ 'price-range': never }>(url);

		expect(params['price-range']?.operator).toBe('range');
	});
});
