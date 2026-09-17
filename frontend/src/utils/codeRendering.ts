import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

/** Ancho de módulo en unidades del viewBox; la zona muda usa el 10x recomendado por la norma. */
const MODULE_WIDTH = 2;
const BASE_BAR_HEIGHT = 40;
const MIN_BAR_HEIGHT = 12;
const MAX_BAR_HEIGHT = 400;

const BASE_OPTIONS = {
  format: 'CODE128',
  displayValue: true,
  width: MODULE_WIDTH,
  fontSize: 10,
  textMargin: 1,
  margin: 0,
  marginLeft: MODULE_WIDTH * 10,
  marginRight: MODULE_WIDTH * 10,
  background: '#ffffff',
  lineColor: '#111827',
} as const;

function buildFallbackSvg(message: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 60');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '12');
  text.setAttribute('y', '32');
  text.setAttribute('fill', '#64748b');
  text.setAttribute('font-size', '12');
  text.textContent = message;
  svg.appendChild(text);

  return svg;
}

function replaceContent(svg: SVGSVGElement, source: SVGSVGElement) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  svg.setAttribute('viewBox', source.getAttribute('viewBox') ?? '0 0 180 60');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  while (source.firstChild) {
    svg.appendChild(source.firstChild);
  }
}

function readViewBox(svg: SVGSVGElement) {
  const parts = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  if (parts.length < 4 || !Number.isFinite(parts[2]) || !Number.isFinite(parts[3])) {
    return null;
  }
  return { widthUnits: parts[2], heightUnits: parts[3] };
}

/**
 * Dibuja el código de barras dentro del SVG.
 *
 * Cuando se indica `aspectRatio` (ancho/alto del hueco disponible) se recalcula
 * el alto de las barras para que el SVG tenga esa misma proporción: así llena
 * el área con `xMidYMid meet`, sin deformar los módulos ni salirse de la etiqueta.
 */
export function renderBarcodeIntoSvg(svg: SVGSVGElement, value: string, options: { aspectRatio?: number } = {}) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  if (!value) {
    replaceContent(svg, buildFallbackSvg('Sin código'));
    return;
  }

  try {
    JsBarcode(svg, value, { ...BASE_OPTIONS, height: BASE_BAR_HEIGHT });

    const aspectRatio = options.aspectRatio;
    const viewBox = readViewBox(svg);
    if (aspectRatio && aspectRatio > 0 && viewBox && viewBox.widthUnits > 0) {
      // Todo lo que no son barras (texto y separaciones) mantiene su alto.
      const chromeHeight = viewBox.heightUnits - BASE_BAR_HEIGHT;
      const desiredTotalHeight = viewBox.widthUnits / aspectRatio;
      const nextBarHeight = Math.min(MAX_BAR_HEIGHT, Math.max(MIN_BAR_HEIGHT, desiredTotalHeight - chromeHeight));
      if (Math.abs(nextBarHeight - BASE_BAR_HEIGHT) > 1) {
        JsBarcode(svg, value, { ...BASE_OPTIONS, height: nextBarHeight });
      }
    }

    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    // El tamaño lo define el hueco de la etiqueta vía CSS, no el SVG.
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('class', 'barcode-svg');
  } catch {
    replaceContent(svg, buildFallbackSvg('Código no disponible'));
  }
}

export function buildBarcodeMarkup(value: string, options: { aspectRatio?: number } = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'barcode-svg');
  renderBarcodeIntoSvg(svg, value, options);
  svg.setAttribute('class', 'barcode-svg');
  return svg.outerHTML;
}

export async function buildQrDataUrl(value: string) {
  if (!value) {
    return '';
  }

  try {
    return await QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      // Resolución suficiente para imprimir nítido incluso en etiquetas pequeñas.
      width: 512,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    });
  } catch {
    return '';
  }
}
