import { CURRENCY_MINOR_UNITS, toMinorUnits } from './consts';
import { describe, expect, it } from 'vitest';

describe('CURRENCY_MINOR_UNITS', () => {
	it('covers all supported currencies', () => {
		expect(Object.keys(CURRENCY_MINOR_UNITS).sort()).toEqual([
			'EUR',
			'JPY',
			'KRW',
			'PLN',
			'USD',
			'VND',
		]);
	});
});

describe('toMinorUnits', () => {
	it('converts 2-decimal currencies', () => {
		expect(toMinorUnits(12.3, 'USD')).toBe(1230);
		expect(toMinorUnits(19.99, 'EUR')).toBe(1999);
		expect(toMinorUnits(45.5, 'PLN')).toBe(4550);
	});

	it('handles zero-decimal currencies', () => {
		expect(toMinorUnits(125000, 'VND')).toBe(125000);
		expect(toMinorUnits(1500, 'JPY')).toBe(1500);
		expect(toMinorUnits(75000, 'KRW')).toBe(75000);
	});

	it('rounds fractional amounts instead of truncating', () => {
		expect(toMinorUnits(10.125, 'USD')).toBe(1013);
		expect(toMinorUnits(10.124, 'USD')).toBe(1012);
	});

	it('falls back to 2 decimals for unknown currencies', () => {
		expect(toMinorUnits(5.1, 'XXX')).toBe(510);
	});

	it('handles zero and negative amounts', () => {
		expect(toMinorUnits(0, 'USD')).toBe(0);
		expect(toMinorUnits(-3.5, 'USD')).toBe(-350);
	});
});
