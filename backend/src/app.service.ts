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

export interface PrintDocument {
  title: string;
  template: string;
  widthMm: number;
  heightMm: number;
  labels: PreviewLabel[];
  generatedAt: string;
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

    const firstLineTokens = this.tokenize(lines[0]);
    const hasHeader = this.looksLikeHeader(firstLineTokens);
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const records = dataLines.map((line, index) => {
      const tokens = this.tokenize(line);
      const parsed = hasHeader
        ? this.parseHeaderRow(tokens, firstLineTokens)
        : this.parsePositionalRow(tokens);
      const name = parsed.name;
      const code = parsed.code;
      const priceValue = parsed.priceValue;
      const discountValue = parsed.discountValue;

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
    const firstLabel = labels[0];

    return {
      status: 'ready-for-print',
      printDocument: {
        title: 'Etiquetas listas para imprimir',
        template: firstLabel?.template ?? 'standard',
        widthMm: firstLabel?.templateWidthMm ?? TEMPLATE_SIZES.standard.widthMm,
        heightMm: firstLabel?.templateHeightMm ?? TEMPLATE_SIZES.standard.heightMm,
        labels,
        generatedAt: new Date().toISOString(),
      } satisfies PrintDocument,
    };
  }

  private tokenize(line: string) {
    if (line.includes('\t')) {
      return line.split('\t').map((value) => value.trim()).filter(Boolean);
    }

    if (line.includes(',')) {
      return line.split(',').map((value) => value.trim()).filter(Boolean);
    }

    return line
      .split(/\s+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private looksLikeHeader(tokens: string[]) {
    const normalized = tokens.map((token) => token.toLowerCase());
    const headerTerms = ['nombre', 'name', 'producto', 'codigo', 'code', 'sku', 'precio', 'price', 'valor', 'descuento', 'discount'];
    return normalized.length > 0 && normalized.every((token) => headerTerms.includes(token));
  }

  private parseHeaderRow(values: string[], header: string[]) {
    return {
      name: this.readField(values, header, ['nombre', 'name', 'producto']),
      code: this.readField(values, header, ['codigo', 'code', 'sku']),
      priceValue: this.readField(values, header, ['precio', 'price', 'valor']),
      discountValue: this.readField(values, header, ['descuento', 'discount', 'discountprice']),
    };
  }

  private parsePositionalRow(tokens: string[]) {
    if (tokens.length >= 4) {
      return {
        name: tokens.slice(0, -3).join(' '),
        code: tokens[tokens.length - 3] ?? '',
        priceValue: tokens[tokens.length - 2] ?? '',
        discountValue: tokens[tokens.length - 1] ?? '',
      };
    }

    if (tokens.length === 3) {
      return {
        name: tokens[0] ?? '',
        code: tokens[1] ?? '',
        priceValue: tokens[2] ?? '',
        discountValue: '',
      };
    }

    return {
      name: tokens[0] ?? '',
      code: tokens[1] ?? '',
      priceValue: tokens[2] ?? '',
      discountValue: tokens[3] ?? '',
    };
  }

  private readField(values: string[], header: string[], aliases: string[]) {
    const headerIndex = header.findIndex((field) => aliases.includes(field.toLowerCase()));
    if (headerIndex >= 0 && values[headerIndex]) {
      return values[headerIndex];
    }

    return '';
  }
}
