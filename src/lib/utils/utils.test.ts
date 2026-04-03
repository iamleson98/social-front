import { normalizeVietnamese } from './utils';
import { describe, it, expect } from 'vitest';

describe('normalizeVietnamese', () => {
	it('removes tone marks', () => {
		expect(normalizeVietnamese('hòa bình')).toBe('hoa binh');
		expect(normalizeVietnamese('thành phố')).toBe('thanh pho');
		expect(normalizeVietnamese('cảm ơn')).toBe('cam on');
	});

	it('removes vowel diacritics', () => {
		expect(normalizeVietnamese('ă â ê ô ơ ư')).toBe('a a e o o u');
		expect(normalizeVietnamese('ắ ằ ẳ ẵ ặ')).toBe('a a a a a');
		expect(normalizeVietnamese('ế ề ể ễ ệ')).toBe('e e e e e');
	});

	it('converts đ and Đ', () => {
		expect(normalizeVietnamese('điện biên')).toBe('dien bien');
		expect(normalizeVietnamese('Đắk Lắk')).toBe('dak lak');
	});

	it('handles uppercase and lowercase', () => {
		expect(normalizeVietnamese('HÒA BÌNH')).toBe('hoa binh');
		expect(normalizeVietnamese('ĐÀ NẴNG')).toBe('da nang');
	});

	it('handles mixed text', () => {
		expect(normalizeVietnamese('Số 1, đường Hòa Bình')).toBe('so 1, duong hoa binh');
	});

	it('handles empty and non-accented strings', () => {
		expect(normalizeVietnamese('')).toBe('');
		expect(normalizeVietnamese('hello world')).toBe('hello world');
	});
});
