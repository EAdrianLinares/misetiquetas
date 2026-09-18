import { describe, expect, it } from 'vitest';
import { buildLabelMetrics, codeSizeWarning } from './labelMetrics';

describe('buildLabelMetrics', () => {
  it.each([
    [80, 50],
    [54, 33.75],
    [50, 30],
    [20, 10],
  ])('el contenido de una etiqueta %d × %d mm nunca excede su alto', (widthMm, heightMm) => {
    const metrics = buildLabelMetrics({ widthMm, heightMm });
    const stack =
      metrics.paddingMm * 2 + metrics.gapMm * 2 + metrics.nameBlockMm + metrics.codeBlockMm + metrics.priceBlockMm;
    // Tolerancia de redondeo a centésimas.
    expect(stack).toBeLessThanOrEqual(heightMm + 0.02);
    expect(metrics.qrSizeMm).toBeLessThanOrEqual(metrics.codeBlockMm);
    expect(metrics.contentWidthMm).toBeLessThan(widthMm);
  });

  it('aplica mínimos a medidas inválidas', () => {
    expect(buildLabelMetrics({ widthMm: 0, heightMm: Number.NaN })).toMatchObject({ widthMm: 10, heightMm: 8 });
  });
});

describe('codeSizeWarning', () => {
  it('no avisa con un código de barras de tamaño suficiente', () => {
    expect(codeSizeWarning(buildLabelMetrics({ widthMm: 80, heightMm: 50 }), 'barcode')).toBeNull();
  });

  it('avisa si el código de barras queda por debajo de 30 × 10 mm', () => {
    expect(codeSizeWarning(buildLabelMetrics({ widthMm: 28, heightMm: 20 }), 'barcode')).toMatch(/30 × 10 mm/);
  });

  it('avisa si el QR mide menos de 20 mm', () => {
    expect(codeSizeWarning(buildLabelMetrics({ widthMm: 50, heightMm: 30 }), 'qr')).toMatch(/20 mm/);
    expect(codeSizeWarning(buildLabelMetrics({ widthMm: 80, heightMm: 60 }), 'qr')).toBeNull();
  });
});
