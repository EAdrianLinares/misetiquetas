import { useEffect, useRef } from 'react';
import { buildQrDataUrl, renderBarcodeIntoSvg } from '../utils/codeRendering';

interface BarcodePreviewProps {
  value: string;
  codeType: string;
  template: string;
}

export function BarcodePreview({ value, codeType, template }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const img = imgRef.current;

    if (codeType === 'barcode') {
      if (!svg) {
        return;
      }

      if (img) {
        img.removeAttribute('src');
      }
      renderBarcodeIntoSvg(svg, value, template);
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
    buildQrDataUrl(value)
      .then((src: string) => {
        if (active) {
          if (src) {
            img.src = src;
            img.alt = `Código QR para ${value}`;
            return;
          }

          img.removeAttribute('src');
          img.alt = 'Código QR no disponible';
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
  }, [value, codeType, template]);

  if (codeType === 'qr') {
    return <img ref={imgRef} className="qr-image" alt="Código QR" />;
  }

  return <svg ref={svgRef} className="barcode-svg" />;
}
