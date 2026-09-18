/**
 * Todas las medidas internas de una etiqueta se derivan de su tamaño físico
 * final, de modo que el contenido nunca crece más allá del recuadro declarado.
 * La suma vertical siempre es exactamente `heightMm`:
 *
 *   padding + nombre + gap + código + gap + precio + padding = alto
 */
export interface LabelMetrics {
  widthMm: number;
  heightMm: number;
  paddingMm: number;
  gapMm: number;
  radiusMm: number;
  contentWidthMm: number;
  nameBlockMm: number;
  nameFontMm: number;
  codeBlockMm: number;
  priceBlockMm: number;
  priceFontMm: number;
  strikeFontMm: number;
  priceGapMm: number;
  qrSizeMm: number;
  /** Relación ancho/alto del área disponible para el código. */
  codeAspectRatio: number;
}

const MIN_LABEL_WIDTH_MM = 10;
const MIN_LABEL_HEIGHT_MM = 8;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildLabelMetrics(args: { widthMm: number; heightMm: number }): LabelMetrics {
  const widthMm = Math.max(MIN_LABEL_WIDTH_MM, Number(args.widthMm) || MIN_LABEL_WIDTH_MM);
  const heightMm = Math.max(MIN_LABEL_HEIGHT_MM, Number(args.heightMm) || MIN_LABEL_HEIGHT_MM);

  const paddingMm = round(clamp(heightMm * 0.06, 0.8, 4));
  const gapMm = round(clamp(heightMm * 0.04, 0.4, 2.5));
  const contentWidthMm = round(Math.max(1, widthMm - paddingMm * 2));
  const stackHeightMm = Math.max(1, heightMm - paddingMm * 2 - gapMm * 2);

  const nameBlockMm = round(stackHeightMm * 0.2);
  const priceBlockMm = round(stackHeightMm * 0.22);
  const codeBlockMm = round(Math.max(3, stackHeightMm - nameBlockMm - priceBlockMm));

  const nameFontMm = round(Math.min(nameBlockMm * 0.42, contentWidthMm * 0.1));
  const priceFontMm = round(Math.min(priceBlockMm * 0.62, contentWidthMm * 0.16));

  return {
    widthMm,
    heightMm,
    paddingMm,
    gapMm,
    radiusMm: round(clamp(heightMm * 0.05, 0.5, 3)),
    contentWidthMm,
    nameBlockMm,
    nameFontMm,
    codeBlockMm,
    priceBlockMm,
    priceFontMm,
    strikeFontMm: round(priceFontMm * 0.72),
    priceGapMm: round(clamp(contentWidthMm * 0.05, 0.8, 4)),
    qrSizeMm: round(Math.min(codeBlockMm, contentWidthMm * 0.62)),
    codeAspectRatio: round(contentWidthMm / codeBlockMm),
  };
}

/** Tamaños mínimos legibles (docs/specs/print-engine/requirements.md). */
export const MIN_CODE_SIZE_MM = {
  qr: 20,
  barcodeWidth: 30,
  barcodeHeight: 10,
} as const;

/**
 * Avisa cuando el código impreso queda por debajo del mínimo legible. No bloquea
 * la impresión: el lector puede funcionar igual, pero conviene probarlo.
 */
export function codeSizeWarning(metrics: LabelMetrics, codeType: 'barcode' | 'qr'): string | null {
  if (codeType === 'qr') {
    return metrics.qrSizeMm < MIN_CODE_SIZE_MM.qr
      ? `El QR medirá ${metrics.qrSizeMm} mm, menos de los ${MIN_CODE_SIZE_MM.qr} mm recomendados. Usa una etiqueta más grande o prueba que el lector lo reconozca.`
      : null;
  }

  return metrics.contentWidthMm < MIN_CODE_SIZE_MM.barcodeWidth ||
    metrics.codeBlockMm < MIN_CODE_SIZE_MM.barcodeHeight
    ? `El código de barras tendrá ${metrics.contentWidthMm} × ${metrics.codeBlockMm} mm, menos de los ${MIN_CODE_SIZE_MM.barcodeWidth} × ${MIN_CODE_SIZE_MM.barcodeHeight} mm recomendados. Usa una etiqueta más grande o menos columnas.`
    : null;
}

/** Variables CSS consumidas por `.label-card` en la vista previa y en la impresión. */
export function labelCssVars(metrics: LabelMetrics): Record<string, string> {
  return {
    '--label-width-mm': `${metrics.widthMm}mm`,
    '--label-height-mm': `${metrics.heightMm}mm`,
    '--label-padding': `${metrics.paddingMm}mm`,
    '--label-gap': `${metrics.gapMm}mm`,
    '--label-radius': `${metrics.radiusMm}mm`,
    '--label-name-block': `${metrics.nameBlockMm}mm`,
    '--label-name-font': `${metrics.nameFontMm}mm`,
    '--label-code-block': `${metrics.codeBlockMm}mm`,
    '--label-price-block': `${metrics.priceBlockMm}mm`,
    '--label-price-font': `${metrics.priceFontMm}mm`,
    '--label-strike-font': `${metrics.strikeFontMm}mm`,
    '--label-price-gap': `${metrics.priceGapMm}mm`,
    '--label-qr-size': `${metrics.qrSizeMm}mm`,
  };
}

/** Las mismas variables como atributo `style` para el HTML de impresión. */
export function labelStyleAttribute(metrics: LabelMetrics) {
  return Object.entries(labelCssVars(metrics))
    .map(([property, value]) => `${property}:${value}`)
    .join(';');
}
