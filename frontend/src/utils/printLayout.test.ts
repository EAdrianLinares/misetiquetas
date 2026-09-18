import { describe, expect, it } from 'vitest';
import type { PrintSettings } from '../types';
import { buildLayoutPlan, buildPrintSettings, findPaperProfile, paginate } from './printLayout';

function settingsFor(profileId: string, overrides: Partial<PrintSettings> = {}): PrintSettings {
  return {
    ...buildPrintSettings({ profile: findPaperProfile(profileId), allowZeroMarginOnContinuous: false }),
    ...overrides,
  };
}

describe('buildLayoutPlan', () => {
  it('rollo de 58 mm: reduce la etiqueta estándar al ancho imprimible y ajusta la página al contenido', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 80,
      labelHeightMm: 50,
      totalItems: 4,
      settings: settingsFor('continuous-58-default'),
    });
    expect(plan).toMatchObject({
      printableWidthMm: 54,
      columns: 1,
      labelScale: 0.675,
      labelWidthMm: 54,
      labelHeightMm: 33.75,
      rowsPerPage: 4,
      pageCount: 1,
      // 1 + 2 de márgenes + 4 × 33,75 + 3 × 2 de separación = 144
      paperHeightMm: 144,
      isContinuous: true,
    });
    expect(plan.warnings[0]).toMatch(/se redujo a 54 × 33.75 mm \(68%\)/);
  });

  it('A4 a 2 columnas: respeta el tamaño y pagina por filas completas', () => {
    const plan = buildLayoutPlan({ labelWidthMm: 80, labelHeightMm: 50, totalItems: 25, settings: settingsFor('a4-default') });
    expect(plan).toMatchObject({
      paperWidthMm: 210,
      paperHeightMm: 297,
      printableWidthMm: 190,
      columns: 2,
      labelScale: 1,
      // floor((277 + 3) / (50 + 3)) = 5 filas
      rowsPerPage: 5,
      itemsPerPage: 10,
      pageCount: 3,
    });
    expect(plan.warnings).toEqual([]);
  });

  it('reduce columnas cuando no caben en el papel y lo avisa', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 50,
      labelHeightMm: 30,
      totalItems: 1,
      settings: settingsFor('continuous-58-default', { columns: 4, gapHorizontalMm: 2 }),
    });
    expect(plan.columns).toBe(2);
    expect(plan.warnings[0]).toMatch(/no admite 4 columnas; se imprimirá en 2/);
  });

  it('modo fill amplía la etiqueta al ancho disponible', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 80,
      labelHeightMm: 50,
      totalItems: 1,
      settings: settingsFor('a4-default', { columns: 1, labelFitMode: 'fill' }),
    });
    expect(plan.labelScale).toBe(2.375);
    expect(plan.labelWidthMm).toBe(190);
    expect(plan.warnings[0]).toMatch(/se amplió/);
  });

  it('modo none no escala y avisa si la etiqueta se recorta', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 80,
      labelHeightMm: 50,
      totalItems: 1,
      settings: settingsFor('continuous-58-default', { labelFitMode: 'none' }),
    });
    expect(plan.labelScale).toBe(1);
    expect(plan.labelWidthMm).toBe(80);
    expect(plan.warnings[0]).toMatch(/se recortará/);
  });

  it('página fija en rollo: respeta la longitud al milímetro y avisa si queda apaisada', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 50,
      labelHeightMm: 30,
      totalItems: 3,
      settings: settingsFor('continuous-58-default', { continuousPageMode: 'fixed', pageLengthMm: 40 }),
    });
    expect(plan.paperHeightMm).toBe(40);
    expect(plan.rowsPerPage).toBe(1);
    expect(plan.pageCount).toBe(3);
    expect(plan.warnings.some((warning) => /más ancha que alta/.test(warning))).toBe(true);
  });

  it('una etiqueta por página en rollo', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 50,
      labelHeightMm: 30,
      totalItems: 5,
      settings: settingsFor('continuous-80-default', { continuousPageMode: 'label' }),
    });
    expect(plan.rowsPerPage).toBe(1);
    expect(plan.pageCount).toBe(5);
  });

  it('A4 horizontal intercambia las medidas del papel', () => {
    const plan = buildLayoutPlan({
      labelWidthMm: 80,
      labelHeightMm: 50,
      totalItems: 1,
      settings: settingsFor('a4-default', { orientation: 'landscape' }),
    });
    expect([plan.paperWidthMm, plan.paperHeightMm]).toEqual([297, 210]);
  });
});

describe('buildPrintSettings', () => {
  it('el perfil personalizado aplica un margen mínimo de 5 mm', () => {
    const settings = buildPrintSettings({
      profile: findPaperProfile('custom'),
      customSettings: { paperType: 'continuous-80', marginLeftMm: 0 },
      allowZeroMarginOnContinuous: false,
    });
    expect(settings.marginLeftMm).toBe(5);
  });

  it('permite 0 mm en continuo sólo si el usuario lo habilita', () => {
    const settings = buildPrintSettings({
      profile: findPaperProfile('custom'),
      customSettings: { paperType: 'continuous-80', marginLeftMm: 0 },
      allowZeroMarginOnContinuous: true,
    });
    expect(settings.marginLeftMm).toBe(0);
  });

  it('los perfiles predefinidos conservan sus márgenes', () => {
    expect(settingsFor('continuous-58-default').marginTopMm).toBe(1);
  });

  it('un perfil desconocido cae en el primero', () => {
    expect(findPaperProfile('no-existe').id).toBe('continuous-58-default');
  });
});

describe('paginate', () => {
  it('parte la lista en páginas del tamaño indicado', () => {
    expect(paginate([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(paginate([1, 2], 0)).toEqual([[1], [2]]);
  });
});
