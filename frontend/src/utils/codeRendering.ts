import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

function buildFallbackSvg(message: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 180 60');
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

export function renderBarcodeIntoSvg(svg: SVGSVGElement, value: string, template: string) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  if (!value) {
    const fallback = buildFallbackSvg('Sin código');
    while (fallback.firstChild) {
      svg.appendChild(fallback.firstChild);
    }
    return;
  }

  try {
    JsBarcode(svg, value, {
      format: 'CODE128',
      displayValue: false,
      width: template === 'compact' ? 1.4 : 1.8,
      height: template === 'compact' ? 28 : 48,
      margin: 8,
      background: '#ffffff',
      lineColor: '#111827',
    });
  } catch {
    const fallback = buildFallbackSvg('Código no disponible');
    while (fallback.firstChild) {
      svg.appendChild(fallback.firstChild);
    }
  }
}

export function buildBarcodeMarkup(value: string, template: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'barcode-svg');
  renderBarcodeIntoSvg(svg, value, template);
  return svg.outerHTML;
}

export async function buildQrDataUrl(value: string) {
  if (!value) {
    return '';
  }

  try {
    return await QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    });
  } catch {
    return '';
  }
}
