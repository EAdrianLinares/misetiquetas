import type { PreviewLabel } from '../domain/labels';
import type { PrintSettings } from '../types';
import { buildBarcodeMarkup, buildQrDataUrl } from './codeRendering';
import { buildLabelMetrics, labelStyleAttribute, type LabelMetrics } from './labelMetrics';
import { buildLayoutPlan, paginate, type LayoutPlan } from './printLayout';

const PRINT_TITLE = 'Etiquetas listas para imprimir';

const currencyFormatter = new Intl.NumberFormat('es-CO');

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildPriceMarkup(label: PreviewLabel) {
  const price = currencyFormatter.format(label.price);

  if (label.discountPrice === null) {
    return `<p class="label-price-row"><span class="label-price-current">${price}</span></p>`;
  }

  return `<p class="label-price-row"><span class="label-price-strike">${price}</span><span class="label-discount-current">${currencyFormatter.format(label.discountPrice)}</span></p>`;
}

async function buildCodeMarkup(label: PreviewLabel, metrics: LabelMetrics) {
  if (label.codeType === 'qr') {
    const src = await buildQrDataUrl(label.code);
    if (!src) {
      return '<div class="code-fallback">Código QR no disponible</div>';
    }

    return `<img class="qr-image" src="${src}" alt="Código QR para ${escapeHtml(label.code)}" />`;
  }

  return buildBarcodeMarkup(label.code, { aspectRatio: metrics.codeAspectRatio });
}

async function buildLabelMarkup(label: PreviewLabel, metrics: LabelMetrics) {
  const codeMarkup = await buildCodeMarkup(label, metrics);
  const classes = ['label-card'];

  classes.push(label.codeType === 'qr' ? 'qr-mode' : 'barcode-mode');

  return `<article class="${classes.join(' ')}" style="${labelStyleAttribute(metrics)}"><p class="label-name">${escapeHtml(label.name)}</p><div class="barcode-wrap">${codeMarkup}</div>${buildPriceMarkup(label)}</article>`;
}

function buildPageSizeValue(layoutPlan: LayoutPlan) {
  return `${layoutPlan.paperWidthMm}mm ${layoutPlan.paperHeightMm}mm`;
}

/**
 * Documento de impresión. Usa el mismo `buildLayoutPlan` y las mismas métricas
 * que la vista previa, así que ambos no pueden divergir (ADR-002).
 */
export async function buildPrintDocumentHtml(args: {
  labels: PreviewLabel[];
  settings: PrintSettings;
  labelWidthMm: number;
  labelHeightMm: number;
}) {
  const { labels, settings } = args;
  const layoutPlan = buildLayoutPlan({
    labelWidthMm: args.labelWidthMm,
    labelHeightMm: args.labelHeightMm,
    totalItems: labels.length,
    settings,
  });
  const metrics = buildLabelMetrics({
    widthMm: layoutPlan.labelWidthMm,
    heightMm: layoutPlan.labelHeightMm,
  });
  const labelMarkup = await Promise.all(labels.map((label) => buildLabelMarkup(label, metrics)));
  const pages = paginate(labelMarkup, layoutPlan.itemsPerPage);
  const pageMarkup = pages
    .map((pageLabels) => `<section class="print-page"><div class="print-grid">${pageLabels.join('')}</div></section>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${PRINT_TITLE}</title>
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        background: #e2e8f0;
        color: #111827;
      }

      .print-shell {
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .print-header {
        width: 100%;
        max-width: 760px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px 16px;
        font-size: 12px;
        color: #334155;
      }

      .print-hint {
        width: 100%;
        max-width: 760px;
        margin: 0;
        padding: 10px 14px;
        border-radius: 8px;
        background: #fef3c7;
        color: #92400e;
        font-size: 12px;
        line-height: 1.5;
      }

      .print-hint strong {
        display: block;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .print-hint ol {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      /*
        La página mide exactamente el papel y los márgenes se aplican como
        padding: así el navegador no vuelve a restarlos y nada queda fuera.
        Se descuenta una fracción del alto para evitar páginas en blanco por
        redondeo del motor de impresión.
      */
      .print-page {
        width: ${layoutPlan.paperWidthMm}mm;
        height: calc(${layoutPlan.paperHeightMm}mm - 0.2mm);
        padding: ${settings.marginTopMm}mm ${settings.marginRightMm}mm ${settings.marginBottomMm}mm ${settings.marginLeftMm}mm;
        background: #ffffff;
        overflow: hidden;
        break-after: page;
        page-break-after: always;
      }

      .print-page:last-child {
        break-after: auto;
        page-break-after: auto;
      }

      .print-grid {
        display: grid;
        grid-template-columns: repeat(${layoutPlan.columns}, minmax(0, 1fr));
        column-gap: ${settings.gapHorizontalMm}mm;
        row-gap: ${settings.gapVerticalMm}mm;
        align-content: start;
        justify-items: center;
        height: 100%;
      }

      .label-card {
        border: 0.2mm solid #cbd5e1;
        border-radius: var(--label-radius);
        padding: var(--label-padding);
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: var(--label-gap);
        width: var(--label-width-mm);
        height: var(--label-height-mm);
        overflow: hidden;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .label-name {
        flex: 0 0 auto;
        height: var(--label-name-block);
        margin: 0;
        text-align: center;
        font-weight: 700;
        font-size: var(--label-name-font);
        line-height: 1.15;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow-wrap: anywhere;
      }

      .barcode-wrap {
        flex: 0 0 auto;
        height: var(--label-code-block);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        overflow: hidden;
      }

      .barcode-svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      .qr-image {
        display: block;
        width: var(--label-qr-size);
        height: var(--label-qr-size);
      }

      .label-price-row {
        flex: 0 0 auto;
        height: var(--label-price-block);
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--label-price-gap);
        line-height: 1.1;
        color: #334155;
        overflow: hidden;
      }

      .label-price-current,
      .label-discount-current {
        font-size: var(--label-price-font);
        font-weight: 800;
      }

      .label-price-strike {
        font-size: var(--label-strike-font);
        color: #64748b;
        text-decoration: line-through;
      }

      .label-discount-current {
        color: #16a34a;
      }

      .code-fallback {
        color: #64748b;
        font-size: var(--label-strike-font);
        text-align: center;
      }

      @page {
        size: ${buildPageSizeValue(layoutPlan)};
        margin: 0;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .print-shell {
          padding: 0;
          display: block;
        }

        .print-header,
        .print-hint {
          display: none;
        }

        .print-page {
          margin: 0;
          box-shadow: none;
        }
      }

      @media screen {
        .print-page {
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
          margin-bottom: 12px;
        }
      }
    </style>
  </head>
  <body>
    <main class="print-shell">
      <header class="print-header">
        <span>${PRINT_TITLE}</span>
        <span>${layoutPlan.paperWidthMm} × ${layoutPlan.paperHeightMm} mm · etiqueta ${layoutPlan.labelWidthMm} × ${layoutPlan.labelHeightMm} mm · ${layoutPlan.columns} col. · ${layoutPlan.pageCount} página(s)</span>
        <span>${escapeHtml(new Date().toLocaleString('es-CO'))}</span>
      </header>
      <div class="print-hint">
        <strong>Papel requerido: ${layoutPlan.paperWidthMm} × ${layoutPlan.paperHeightMm} mm</strong>
        Si la vista previa muestra una hoja de otro tamaño, la está imponiendo el driver de la impresora. Para corregirlo:
        <ol>
          <li>Abre <b>Más ajustes</b> y en <b>Tamaño del papel</b> elige ${layoutPlan.paperWidthMm} × ${layoutPlan.paperHeightMm} mm.</li>
          <li>Pon <b>Márgenes: Ninguno</b> y <b>Escala: 100%</b> (desactiva «Ajustar al área de impresión»).</li>
          <li>Si ese tamaño no aparece, créalo en las preferencias de la impresora en Windows (Dispositivos e impresoras → Preferencias de impresión → tamaño personalizado).</li>
        </ol>
      </div>
      ${pageMarkup}
    </main>
    <script>
      window.addEventListener('load', () => {
        const pendingImages = Array.from(document.images).filter((image) => !image.complete);
        if (pendingImages.length === 0) {
          window.focus();
          window.print();
          return;
        }

        let loaded = 0;
        const finish = () => {
          loaded += 1;
          if (loaded === pendingImages.length) {
            window.focus();
            window.print();
          }
        };

        pendingImages.forEach((image) => {
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        });
      });
    </script>
  </body>
</html>`;
}
