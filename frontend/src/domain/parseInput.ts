import { buildRecord, type ParsedRecord, type RecordFields } from './records';

type Separator = '\t' | ';' | ',' | 'space';
type Field = keyof RecordFields;

export interface ParseResult {
  records: ParsedRecord[];
  /** Errores globales de la entrada (no de un registro concreto). */
  errors: string[];
  separator: Separator | null;
  hasHeader: boolean;
}

export const MAX_RECORDS = 1000;

const HEADER_ALIASES: Record<Field, string[]> = {
  name: ['nombre', 'name', 'producto', 'descripcion', 'articulo'],
  code: ['codigo', 'code', 'sku', 'referencia', 'ref'],
  priceText: ['precio', 'price', 'valor', 'pvp'],
  discountText: ['descuento', 'discount', 'precio descuento', 'precio oferta', 'oferta'],
};

const POSITIONAL_FIELDS: Field[] = ['name', 'code', 'priceText', 'discountText'];

/** Interpreta el texto pegado según SPEC-FUNC-006. */
export function parseInput(content: string): ParseResult {
  const lines = content
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((text, index) => ({ text, row: index + 1 }))
    .filter((line) => line.text.trim() !== '');

  if (lines.length === 0) {
    return { records: [], errors: ['No hay datos para interpretar.'], separator: null, hasHeader: false };
  }

  const separator = detectSeparator(lines.map((line) => line.text));
  const rows = lines
    .map((line) => ({ row: line.row, cells: splitLine(line.text, separator) }))
    // Una línea con sólo separadores (fila vacía copiada de Excel) no es un registro.
    .filter((line) => line.cells.some((cell) => cell !== ''));

  const headerMap = separator === 'space' || rows.length === 0 ? null : readHeader(rows[0].cells);
  const dataRows = headerMap ? rows.slice(1) : rows;
  const errors: string[] = [];

  if (dataRows.length > MAX_RECORDS) {
    errors.push(`Se admiten hasta ${MAX_RECORDS} registros por impresión; se recibieron ${dataRows.length}.`);
  }

  const records = dataRows.slice(0, MAX_RECORDS).map(({ row, cells }) => {
    const { fields, extraErrors } =
      separator === 'space'
        ? readSpaceRow(cells)
        : headerMap
          ? readHeaderRow(cells, headerMap)
          : readPositionalRow(cells);
    return buildRecord(`record-${row}`, row, fields, extraErrors);
  });

  if (records.length === 0 && errors.length === 0) {
    errors.push('Sólo se encontró la fila de encabezados; pega también los productos.');
  }

  return { records, errors, separator, hasHeader: headerMap !== null };
}

function detectSeparator(lines: string[]): Separator {
  const text = lines.join('\n');
  if (text.includes('\t')) return '\t';
  if (text.includes(';')) return ';';
  if (text.includes(',')) return ',';
  return 'space';
}

function splitLine(line: string, separator: Separator): string[] {
  if (separator === 'space') {
    return line.trim().split(/\s+/);
  }
  if (separator === '\t') {
    // Las celdas vacías se conservan: nunca deben desplazar las columnas.
    return line.split('\t').map((cell) => cell.trim());
  }
  return splitQuoted(line, separator);
}

/** Separa una línea CSV respetando comillas dobles (`""` es una comilla literal). */
function splitQuoted(line: string, separator: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (inQuotes) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"' && current.trim() === '') {
      inQuotes = true;
      current = '';
    } else if (char === separator) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function readHeader(cells: string[]): Partial<Record<Field, number>> | null {
  const map: Partial<Record<Field, number>> = {};
  cells.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    const field = (Object.keys(HEADER_ALIASES) as Field[]).find(
      (key) => map[key] === undefined && HEADER_ALIASES[key].includes(normalized),
    );
    if (field) {
      map[field] = index;
    }
  });

  return map.name !== undefined && map.code !== undefined && map.priceText !== undefined ? map : null;
}

function readHeaderRow(cells: string[], header: Partial<Record<Field, number>>) {
  const read = (field: Field) => {
    const index = header[field];
    return index === undefined ? '' : cells[index] ?? '';
  };
  return {
    fields: { name: read('name'), code: read('code'), priceText: read('priceText'), discountText: read('discountText') },
    extraErrors: [],
  };
}

function readPositionalRow(cells: string[]) {
  // Las celdas vacías al final (Excel suele añadirlas) no cuentan como columnas de más.
  let lastFilled = cells.length - 1;
  while (lastFilled >= 0 && cells[lastFilled] === '') {
    lastFilled -= 1;
  }
  const extraErrors =
    lastFilled >= POSITIONAL_FIELDS.length
      ? ['La fila tiene más columnas de las esperadas (nombre, código, precio, descuento).']
      : [];
  const [name = '', code = '', priceText = '', discountText = ''] = cells;
  return { fields: { name, code, priceText, discountText }, extraErrors };
}

/**
 * Con espacios el formato es "nombre código precio": el nombre puede tener
 * varias palabras y por eso el descuento no se admite (sería ambiguo).
 */
function readSpaceRow(cells: string[]) {
  if (cells.length < 3) {
    const [name = '', code = '', priceText = ''] = cells;
    return { fields: { name, code, priceText, discountText: '' }, extraErrors: [] };
  }
  return {
    fields: {
      name: cells.slice(0, -2).join(' '),
      code: cells[cells.length - 2],
      priceText: cells[cells.length - 1],
      discountText: '',
    },
    extraErrors: [],
  };
}
