import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodePreviewProps {
  value: string;
  codeType: string;
  template: string;
}

export function BarcodePreview({ value, codeType, template }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isCompact = template === 'compact';

  useEffect(() => {
    const svg = svgRef.current;
    const img = imgRef.current;

    if (codeType === 'barcode') {
      if (!svg) {
        return;
      }

      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      if (img) {
        img.removeAttribute('src');
      }
      if (!value) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '10');
        text.setAttribute('y', '24');
        text.setAttribute('fill', '#64748b');
        text.textContent = 'Sin código';
        svg.appendChild(text);
        return;
      }

      try {
        JsBarcode(svg, value, {
          format: 'CODE128',
          displayValue: false,
          width: isCompact ? 1.4 : 1.8,
          height: isCompact ? 28 : 48,
          margin: 8,
          background: '#ffffff',
          lineColor: '#111827',
        });
      } catch (error) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '10');
        text.setAttribute('y', '24');
        text.setAttribute('fill', '#64748b');
        text.textContent = 'Código no disponible';
        svg.appendChild(text);
      }
      return;
    }

    if (!img) {
      return;
    }

    if (!value) {
      img.removeAttribute('src');
      img.alt = 'Sin código QR';
      return;
    }

    let active = true;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 180,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((src: string) => {
        if (active) {
          img.src = src;
          img.alt = `Código QR para ${value}`;
        }
      })
      .catch(() => {
        if (active) {
          img.removeAttribute('src');
          img.alt = 'Código QR no disponible';
        }
      });

    return () => {
      active = false;
    };
  }, [value, codeType, isCompact]);

  if (codeType === 'qr') {
    return <img ref={imgRef} className="qr-image" alt="Código QR" />;
  }

  return <svg ref={svgRef} className="barcode-svg" />;
}
