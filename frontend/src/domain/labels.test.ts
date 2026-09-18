import { describe, expect, it } from 'vitest';
import { buildLabels, MAX_COPIES, MAX_LABELS, resolveTemplateSize } from './labels';
import { parseInput } from './parseInput';

const records = parseInput('Arroz \t001\t2500\t2000\nFrijol\t\t3000').records;

describe('buildLabels', () => {
  it('genera copias sólo de los registros válidos, con nombre y código recortados', () => {
    const { labels, errors } = buildLabels(records, { codeType: 'barcode', copies: 2 });
    expect(errors).toEqual([]);
    expect(labels.map((label) => label.id)).toEqual(['record-1-1', 'record-1-2']);
    expect(labels[0]).toMatchObject({ name: 'Arroz', code: '001', price: 2500, discountPrice: 2000 });
  });

  it.each([0, -5, 2.7, MAX_COPIES + 1, Number.NaN])('rechaza copias = %s', (copies) => {
    const { labels, errors } = buildLabels(records, { codeType: 'qr', copies });
    expect(labels).toEqual([]);
    expect(errors).toHaveLength(1);
  });

  it(`rechaza más de ${MAX_LABELS} etiquetas`, () => {
    const many = parseInput(Array.from({ length: 20 }, (_, index) => `P${index}\t${index}\t100`).join('\n')).records;
    expect(buildLabels(many, { codeType: 'qr', copies: MAX_COPIES }).errors[0]).toMatch(/máximo por impresión/);
  });

  it('rechaza códigos con tildes o ñ en código de barras, pero no en QR', () => {
    const accented = parseInput('Piña\tPIÑA-1\t2500').records;
    expect(buildLabels(accented, { codeType: 'barcode', copies: 1 }).errors[0]).toMatch(/Fila 1/);
    expect(buildLabels(accented, { codeType: 'qr', copies: 1 }).labels).toHaveLength(1);
  });
});

describe('resolveTemplateSize', () => {
  it('acota la plantilla personalizada a sus límites', () => {
    expect(resolveTemplateSize('custom', { widthMm: 0, heightMm: 999 })).toEqual({ widthMm: 15, heightMm: 300 });
    expect(resolveTemplateSize('custom', { widthMm: 54, heightMm: 40 })).toEqual({ widthMm: 54, heightMm: 40 });
  });

  it('usa el tamaño fijo de las plantillas predefinidas', () => {
    expect(resolveTemplateSize('compact', { widthMm: 1, heightMm: 1 })).toMatchObject({ widthMm: 50, heightMm: 30 });
  });
});
