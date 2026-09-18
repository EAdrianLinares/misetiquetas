import { describe, expect, it } from 'vitest';
import { parseAmount } from './amount';

describe('parseAmount (SPEC-FUNC-006 §4)', () => {
  it.each([
    ['2500', 2500],
    ['1.500', 1500],
    ['1.500.000', 1500000],
    ['12,50', 12.5],
    ['1.500,50', 1500.5],
    ['1,500', 1500],
    ['1,500.50', 1500.5],
    ['12.5', 12.5],
    ['$ 2.500', 2500],
    ['$2500', 2500],
    ['2500 COP', 2500],
    ['0', 0],
  ])('%s → %d', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it.each(['abc', '-5', '1.50.0', '1,2,3', '.5', '12,5.0.0', '1.500,50,1'])('%s → NaN', (raw) => {
    expect(parseAmount(raw)).toBeNaN();
  });

  it('texto vacío → null', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('  $ ')).toBeNull();
  });
});
