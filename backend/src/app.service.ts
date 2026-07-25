import { Injectable } from '@nestjs/common';

export interface ParsedRecord {
  id: string;
  name: string;
  code: string;
  price: number;
  discountPrice: number | null;
  validationState: 'valid' | 'invalid';
  errors: string[];
}

export interface PreviewLabel {
  id: string;
  recordId: string;
  name: string;
  code: string;
  price: number;
  discountPrice: number | null;
  template: string;
  codeType: string;
  templateWidthMm: number;
  templateHeightMm: number;
}

type TemplateSize = {
  widthMm: number;
  heightMm: number;
};

const TEMPLATE_SIZES: Record<string, TemplateSize> = {
  standard: { widthMm: 80, heightMm: 50 },
  compact: { widthMm: 50, heightMm: 30 },
};

@Injectable()
export class AppService {
  parseContent(content: string) {
    const normalized = content.replace(/\r/g, '');
    const lines = normalized
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return { records: [], errors: ['No se recibió contenido para interpretar.'] };
    }

    const delimiter = lines.some((line) => line.includes('\t')) ? '\t' : ',';
    const header = lines[0].split(delimiter).map((value) => value.trim().toLowerCase());
    const dataLines = lines.slice(1);

    const records = dataLines.map((line, index) => {
      const values = line.split(delimiter).map((value) => value.trim());
      const name = this.readField(values, header, ['nombre', 'name', 'producto']);
      const code = this.readField(values, header, ['codigo', 'code', 'sku']);
      const priceValue = this.readField(values, header, ['precio', 'price', 'valor']);
      const discountValue = this.readField(values, header, ['descuento', 'discount', 'discountprice']);

      const price = Number(priceValue);
      const discountPrice = discountValue ? Number(discountValue) : null;
      const errors: string[] = [];

      if (!name) {
        errors.push('El nombre es obligatorio.');
      }
      if (!code) {
        errors.push('El código es obligatorio.');
      }
      if (!Number.isFinite(price) || price <= 0) {
        errors.push('El precio debe ser mayor que cero.');
      }
      if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice < 0)) {
        errors.push('El precio con descuento no es válido.');
      }
      if (discountPrice !== null && price > 0 && discountPrice > price) {
        errors.push('El descuento no puede ser mayor que el precio normal.');
      }

      return {
        id: `record-${index + 1}`,
        name,
        code,
        price: Number.isFinite(price) ? price : 0,
        discountPrice: Number.isFinite(discountPrice) ? discountPrice : null,
        validationState: errors.length > 0 ? 'invalid' : 'valid',
        errors,
      } satisfies ParsedRecord;
    });

    const errors = records.flatMap((record) =>
      record.errors.map((error) => `${record.name || 'Registro'}: ${error}`),
    );

    return { records, errors };
  }

  buildPreview(body: { records: ParsedRecord[]; template: string; codeType: string; copies: number }) {
    const labels: PreviewLabel[] = [];
    const copies = Number(body.copies ?? 1) || 1;
    const template = body.template || 'standard';
    const templateSize = TEMPLATE_SIZES[template] ?? TEMPLATE_SIZES.standard;

    body.records.forEach((record) => {
      for (let index = 0; index < copies; index += 1) {
        labels.push({
          id: `${record.id}-${index + 1}`,
          recordId: record.id,
          name: record.name,
          code: record.code,
          price: record.price,
          discountPrice: record.discountPrice,
          template,
          codeType: body.codeType || 'barcode',
          templateWidthMm: templateSize.widthMm,
          templateHeightMm: templateSize.heightMm,
        });
      }
    });

    return { labels };
  }

  preparePrint(labels: PreviewLabel[]) {
    return {
      status: 'ready-for-print',
      printDocument: {
        template: labels[0]?.template ?? 'standard',
        widthMm: labels[0]?.templateWidthMm ?? TEMPLATE_SIZES.standard.widthMm,
        heightMm: labels[0]?.templateHeightMm ?? TEMPLATE_SIZES.standard.heightMm,
        labels: labels.length,
      },
    };
  }

  private readField(values: string[], header: string[], aliases: string[]) {
    const headerIndex = header.findIndex((field) => aliases.includes(field));
    if (headerIndex >= 0 && values[headerIndex]) {
      return values[headerIndex];
    }

    const fallbackIndex = aliases.findIndex((alias) => header.includes(alias));
    if (fallbackIndex >= 0 && values[fallbackIndex]) {
      return values[fallbackIndex];
    }

    return '';
  }
}
