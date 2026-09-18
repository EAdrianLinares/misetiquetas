/**
 * Interpreta un importe en formato colombiano (ver SPEC-FUNC-006 §4).
 *
 * `.` separa miles y `,` decimales, pero también se acepta el formato en-US
 * cuando no es ambiguo. Devuelve `null` si el texto está vacío y `NaN` si no es
 * un número válido: nunca adivina.
 */
export function parseAmount(raw: string): number | null {
  const text = raw.replace(/cop/gi, '').replace(/[$\s]/g, '');
  if (text === '') {
    return null;
  }
  if (!/^[\d.,]+$/.test(text)) {
    return Number.NaN;
  }

  const lastDot = text.lastIndexOf('.');
  const lastComma = text.lastIndexOf(',');

  if (lastDot >= 0 && lastComma >= 0) {
    // Con los dos separadores, el último es el decimal.
    const decimalSeparator = lastDot > lastComma ? '.' : ',';
    const thousandsSeparator = decimalSeparator === '.' ? ',' : '.';
    const [integerPart, decimalPart, ...rest] = text.split(decimalSeparator);
    if (rest.length > 0 || !/^\d+$/.test(decimalPart) || !isGrouped(integerPart, thousandsSeparator)) {
      return Number.NaN;
    }
    return Number(`${integerPart.split(thousandsSeparator).join('')}.${decimalPart}`);
  }

  const separator = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null;
  if (separator === null) {
    return Number(text);
  }

  if (isGrouped(text, separator)) {
    return Number(text.split(separator).join(''));
  }

  const [integerPart, decimalPart, ...rest] = text.split(separator);
  if (rest.length > 0 || !/^\d+$/.test(integerPart) || !/^\d+$/.test(decimalPart)) {
    return Number.NaN;
  }
  return Number(`${integerPart}.${decimalPart}`);
}

/** `1.500.000` con separador `.`: primer grupo de 1–3 dígitos y el resto de exactamente 3. */
function isGrouped(value: string, separator: string) {
  const groups = value.split(separator);
  return (
    groups.length > 1 &&
    /^\d{1,3}$/.test(groups[0]) &&
    groups.slice(1).every((group) => /^\d{3}$/.test(group))
  );
}
