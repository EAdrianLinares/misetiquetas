import { parseAmount } from './amount';

/**
 * Registro interpretado. Guarda el texto original de los importes para que la
 * tabla de revisión pueda editarlos tal como el usuario los escribe
 * (`1.500`, `$2.500`), y los valores numéricos ya interpretados.
 */
export interface ParsedRecord {
  id: string;
  /** Línea de la entrada original (1-based), para los mensajes de error. */
  row: number;
  name: string;
  code: string;
  priceText: string;
  discountText: string;
  /** `null` si falta; `NaN` nunca llega aquí (se marca como error y queda `null`). */
  price: number | null;
  discountPrice: number | null;
  validationState: 'valid' | 'invalid';
  errors: string[];
}

export interface RecordFields {
  name: string;
  code: string;
  priceText: string;
  discountText: string;
}

/**
 * Construye y valida un registro. Es la única implementación de las reglas de
 * SPEC-FUNC-006 §5: la usan el parser y la edición en la tabla.
 */
export function buildRecord(
  id: string,
  row: number,
  fields: RecordFields,
  extraErrors: string[] = [],
): ParsedRecord {
  // Se guardan sin recortar para que la edición en la tabla permita escribir
  // espacios; la generación de etiquetas usa los valores recortados.
  const { name, code } = fields;
  const errors: string[] = [...extraErrors];

  if (!name.trim()) {
    errors.push('El nombre es obligatorio.');
  }
  if (!code.trim()) {
    errors.push('El código es obligatorio.');
  }

  const priceValue = parseAmount(fields.priceText);
  const price = priceValue !== null && Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null;
  if (price === null) {
    errors.push('El precio debe ser un número mayor que cero.');
  }

  // Vacío o 0 significa "sin descuento" (muchas hojas rellenan con 0).
  const discountValue = parseAmount(fields.discountText);
  let discountPrice: number | null = null;
  if (discountValue !== null && discountValue !== 0) {
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      errors.push('El precio con descuento no es un número válido.');
    } else if (price !== null && discountValue > price) {
      errors.push('El descuento no puede ser mayor que el precio normal.');
    } else {
      discountPrice = discountValue;
    }
  }

  return {
    id,
    row,
    name,
    code,
    priceText: fields.priceText,
    discountText: fields.discountText,
    price,
    discountPrice,
    validationState: errors.length > 0 ? 'invalid' : 'valid',
    errors,
  };
}

/** Aplica una edición de la tabla y revalida el registro. */
export function updateRecordField(record: ParsedRecord, field: keyof RecordFields, value: string): ParsedRecord {
  const fields: RecordFields = {
    name: record.name,
    code: record.code,
    priceText: record.priceText,
    discountText: record.discountText,
    [field]: value,
  };
  return buildRecord(record.id, record.row, fields);
}
