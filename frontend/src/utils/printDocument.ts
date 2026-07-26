import type { PreviewLabel, PrintDocument } from '../types';
import { buildBarcodeMarkup, buildQrDataUrl } from './codeRendering';

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

async function buildCodeMarkup(label: PreviewLabel) {
  if (label.codeType === 'qr') {
    const src = await buildQrDataUrl(label.code);
    if (!src) {
      return '<div class="code-fallback">Código QR no disponible</div>';
    }

    return `<img class="qr-image" src="${src}" alt="Código QR para ${escapeHtml(label.code)}" />`;
  }

  return buildBarcodeMarkup(label.code, label.template);
}

async function buildLabelMarkup(label: PreviewLabel) {
  const codeMarkup = await buildCodeMarkup(label);
  const classes = ['label-card'];

  classes.push(label.codeType === 'qr' ? 'qr-mode' : 'barcode-mode');
  classes.push(label.template === 'compact' ? 'compact-mode' : 'standard-mode');

  return `<article class="${classes.join(' ')}" style="--label-width-mm:${label.templateWidthMm}mm;--label-height-mm:${label.templateHeightMm}mm;"><p class="label-name">${escapeHtml(label.name)}</p><div class="barcode-wrap">${codeMarkup}</div>${buildPriceMarkup(label)}</article>`;
}

export async function buildPrintDocumentHtml(printDocument: PrintDocument) {
  const labelMarkup = await Promise.all(printDocument.labels.map((label) => buildLabelMarkup(label)));

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(printDocument.title)}</title>
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
        background: #f8fafc;
        color: #111827;
      }

      .print-shell {
        padding: 16px;
      }

      .print-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
        font-size: 12px;
        color: #475569;
      }

      .print-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${printDocument.widthMm}mm, 1fr));
        gap: 6mm;
        align-items: start;
      }

      .label-card {
        border: 1px solid #e2e8f0;
        border-radius: 4mm;
        padding: 4mm;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 2mm;
        width: var(--label-width-mm);
        min-height: var(--label-height-mm);
        overflow: hidden;
        break-inside: avoid;
      }

      .label-card.compact-mode {
        padding: 3mm;
        gap: 1.5mm;
      }

      .label-name {
        margin: 0;
        text-align: center;
        font-weight: 700;
        font-size: 14px;
      }

      .compact-mode .label-name {
        font-size: 12px;
      }

      .barcode-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 22mm;
        padding: 2mm 0;
        border: 1px solid #e2e8f0;
        border-radius: 3mm;
        background: #ffffff;
      }

      .compact-mode .barcode-wrap {
        min-height: 14mm;
      }

      .qr-mode .barcode-wrap {
        min-height: 28mm;
      }

      .barcode-svg {
        width: 100%;
        height: auto;
        max-height: 24mm;
      }

      .qr-image {
        display: block;
        width: 100%;
        max-width: 28mm;
        height: auto;
      }

      .label-price-row {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: baseline;
        gap: 3mm;
        color: #334155;
      }

      .label-price-current,
      .label-discount-current {
        font-size: 14px;
        font-weight: 800;
      }

      .label-price-strike {
        font-size: 12px;
        color: #94a3b8;
        text-decoration: line-through;
      }

      .label-discount-current {
        color: #16a34a;
      }

      .code-fallback {
        color: #64748b;
        font-size: 12px;
        text-align: center;
      }

      @page {
        margin: 10mm;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .print-shell {
          padding: 0;
        }

        .print-header {
          display: none;
        }

        .print-grid {
          gap: 3mm;
        }

        .label-card {
          border-color: #cbd5e1;
        }
      }
    </style>
  </head>
  <body>
    <main class="print-shell">
      <header class="print-header">
        <span>${escapeHtml(printDocument.title)}</span>
        <span>${escapeHtml(new Date(printDocument.generatedAt).toLocaleString('es-CO'))}</span>
      </header>
      <section class="print-grid">
        ${labelMarkup.join('')}
      </section>
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
