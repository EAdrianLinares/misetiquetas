import { describe, expect, it } from 'vitest';
import { MAX_RECORDS, parseInput } from './parseInput';
import { updateRecordField } from './records';

function summary(content: string) {
  return parseInput(content).records.map((record) => ({
    name: record.name,
    code: record.code,
    price: record.price,
    discountPrice: record.discountPrice,
    valid: record.validationState === 'valid',
  }));
}

describe('parseInput — casos de la auditoría 2026-09-17', () => {
  it('interpreta 1.500 como mil quinientos', () => {
    expect(summary('Arroz\t001\t1.500')).toEqual([
      { name: 'Arroz', code: '001', price: 1500, discountPrice: null, valid: true },
    ]);
  });

  it('una celda vacía no desplaza las columnas', () => {
    const [record] = parseInput('Arroz\t\t2500\t2000').records;
    expect(record.code).toBe('');
    expect(record.price).toBe(2500);
    expect(record.discountPrice).toBe(2000);
    expect(record.validationState).toBe('invalid');
    expect(record.errors).toContain('El código es obligatorio.');
  });

  it('con espacios, el nombre puede tener varias palabras', () => {
    expect(summary('Arroz Diana 500g ARR-01 2500')).toEqual([
      { name: 'Arroz Diana 500g', code: 'ARR-01', price: 2500, discountPrice: null, valid: true },
    ]);
  });

  it('respeta las comillas CSV', () => {
    expect(summary('"Arroz, 500g",001,2500')).toEqual([
      { name: 'Arroz, 500g', code: '001', price: 2500, discountPrice: null, valid: true },
    ]);
  });

  it('acepta símbolos de moneda y decimales con coma', () => {
    expect(summary('Arroz\t001\t$2.500\t12,50')[0]).toMatchObject({ price: 2500, discountPrice: 12.5, valid: true });
  });

  it('detecta cabeceras con tildes y mayúsculas', () => {
    const result = parseInput('Nombre\tCódigo\tPrecio\nArroz\t001\t2500');
    expect(result.hasHeader).toBe(true);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].name).toBe('Arroz');
  });

  it('descuento 0 significa sin descuento', () => {
    expect(summary('Arroz\t001\t2500\t0')[0]).toMatchObject({ discountPrice: null, valid: true });
  });
});

describe('parseInput — separadores y cabeceras', () => {
  it('usa ; como separador (CSV es-CO) sin romper los decimales con coma', () => {
    expect(summary('Arroz;001;1.500,50')[0]).toMatchObject({ price: 1500.5, valid: true });
  });

  it('con cabecera, las columnas pueden venir en otro orden y se ignoran las desconocidas', () => {
    const content = 'SKU\tStock\tPrecio oferta\tProducto\tPVP\nA-1\t30\t900\tLeche\t1.000';
    expect(summary(content)).toEqual([
      { name: 'Leche', code: 'A-1', price: 1000, discountPrice: 900, valid: true },
    ]);
  });

  it('ignora líneas vacías y filas de sólo separadores, conservando el número de fila', () => {
    const result = parseInput('\nArroz\t001\t2500\n\t\t\t\nFrijol\t002\t3000');
    expect(result.records.map((record) => record.row)).toEqual([2, 4]);
  });

  it('marca columnas de más sin cabecera, pero tolera celdas vacías al final', () => {
    expect(parseInput('Arroz\t001\t2500\t2000\t999').records[0].errors).toContain(
      'La fila tiene más columnas de las esperadas (nombre, código, precio, descuento).',
    );
    expect(parseInput('Arroz\t001\t2500\t\t\t').records[0].validationState).toBe('valid');
  });

  it('informa cuando sólo hay cabecera o no hay datos', () => {
    expect(parseInput('Nombre\tCódigo\tPrecio').errors).toHaveLength(1);
    expect(parseInput('   \n  ').errors).toEqual(['No hay datos para interpretar.']);
  });

  it(`limita a ${MAX_RECORDS} registros`, () => {
    const content = Array.from({ length: MAX_RECORDS + 5 }, (_, index) => `P${index}\t${index}\t100`).join('\n');
    const result = parseInput(content);
    expect(result.records).toHaveLength(MAX_RECORDS);
    expect(result.errors).toHaveLength(1);
  });
});

describe('validación de registros', () => {
  it.each([
    ['Arroz\t001\t0', 'El precio debe ser un número mayor que cero.'],
    ['Arroz\t001\tabc', 'El precio debe ser un número mayor que cero.'],
    ['Arroz\t001\t2500\t3000', 'El descuento no puede ser mayor que el precio normal.'],
    ['Arroz\t001\t2500\txyz', 'El precio con descuento no es un número válido.'],
    ['\t001\t2500', 'El nombre es obligatorio.'],
  ])('%j → %s', (content, error) => {
    expect(parseInput(content).records[0].errors).toContain(error);
  });

  it('la edición en la tabla revalida el registro', () => {
    const [record] = parseInput('Arroz\t\t2500').records;
    expect(record.validationState).toBe('invalid');

    const fixed = updateRecordField(record, 'code', '001');
    expect(fixed.validationState).toBe('valid');
    expect(fixed.errors).toEqual([]);

    const broken = updateRecordField(fixed, 'priceText', '');
    expect(broken.validationState).toBe('invalid');
  });

  it('la edición conserva los espacios mientras se escribe', () => {
    const [record] = parseInput('Arroz\t001\t2500').records;
    expect(updateRecordField(record, 'name', 'Arroz ').name).toBe('Arroz ');
  });
});
