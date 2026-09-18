import type { ParsedRecord } from './records';

export type CodeType = 'barcode' | 'qr';
export type TemplateId = 'standard' | 'compact' | 'custom';

export interface PreviewLabel {
  id: string;
  recordId: string;
  name: string;
  code: string;
  price: number;
  discountPrice: number | null;
  codeType: CodeType;
}

export const TEMPLATE_SIZES = {
  standard: { widthMm: 80, heightMm: 50, label: '80 × 50 mm' },
  compact: { widthMm: 50, heightMm: 30, label: '50 × 30 mm' },
} as const;

/** Límites de una etiqueta declarada a mano (por ejemplo, el troquel del rollo). */
export const CUSTOM_LABEL_LIMITS = {
  widthMm: { min: 15, max: 200 },
  heightMm: { min: 10, max: 300 },
} as const;

export const MAX_COPIES = 500;
export const MAX_LABELS = 5000;

/** Tamaño pedido por la plantilla; en `custom` se acota a los límites. */
export function resolveTemplateSize(template: TemplateId, custom: { widthMm: number; heightMm: number }) {
  if (template !== 'custom') {
    return TEMPLATE_SIZES[template];
  }
  return {
    widthMm: clamp(custom.widthMm, CUSTOM_LABEL_LIMITS.widthMm.min, CUSTOM_LABEL_LIMITS.widthMm.max),
    heightMm: clamp(custom.heightMm, CUSTOM_LABEL_LIMITS.heightMm.min, CUSTOM_LABEL_LIMITS.heightMm.max),
  };
}

export function validateCopies(copies: number): string | null {
  if (!Number.isInteger(copies) || copies < 1 || copies > MAX_COPIES) {
    return `Las copias deben ser un número entero entre 1 y ${MAX_COPIES}.`;
  }
  return null;
}

/** CODE128 sólo codifica ASCII imprimible; tildes y ñ no se pueden representar. */
export function isBarcodeCompatible(code: string) {
  return /^[\x20-\x7E]+$/.test(code);
}

/**
 * Genera las etiquetas a partir de los registros válidos (SPEC-FUNC-006 §6).
 * Devuelve errores en lugar de etiquetas cuando la configuración no permite imprimir.
 */
export function buildLabels(
  records: ParsedRecord[],
  options: { codeType: CodeType; copies: number },
): { labels: PreviewLabel[]; errors: string[] } {
  const errors: string[] = [];
  const copiesError = validateCopies(options.copies);
  if (copiesError) {
    errors.push(copiesError);
  }

  const validRecords = records.filter((record) => record.validationState === 'valid');
  if (options.codeType === 'barcode') {
    validRecords
      .filter((record) => !isBarcodeCompatible(record.code.trim()))
      .forEach((record) =>
        errors.push(
          `Fila ${record.row}: el código «${record.code.trim()}» tiene caracteres que el código de barras no admite. Usa QR o quita tildes y ñ.`,
        ),
      );
  }

  if (!copiesError && validRecords.length * options.copies > MAX_LABELS) {
    errors.push(
      `Se generarían ${validRecords.length * options.copies} etiquetas; el máximo por impresión es ${MAX_LABELS}. Reduce las copias o divide los datos.`,
    );
  }

  if (errors.length > 0) {
    return { labels: [], errors };
  }

  const labels = validRecords.flatMap((record) =>
    Array.from({ length: options.copies }, (_, index) => ({
      id: `${record.id}-${index + 1}`,
      recordId: record.id,
      name: record.name.trim(),
      code: record.code.trim(),
      // Los registros válidos siempre tienen precio.
      price: record.price ?? 0,
      discountPrice: record.discountPrice,
      codeType: options.codeType,
    })),
  );

  return { labels, errors };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}
