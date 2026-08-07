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

export type PaperType =
  'a4' | 'letter' | 'continuous-58' | 'continuous-80' | 'continuous-100';

export type PrintOrientation = 'portrait' | 'landscape';

export interface PrintSettings {
  paperType?: PaperType;
  orientation?: PrintOrientation;
  columns?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  gapHorizontalMm?: number;
  gapVerticalMm?: number;
  allowZeroMarginOnContinuous?: boolean;
}

export interface PrintDocument {
  title: string;
  template: string;
  widthMm: number;
  heightMm: number;
  paperType: PaperType;
  orientation: PrintOrientation;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  columns: number;
  rowsPerPage: number;
  itemsPerPage: number;
  pageCount: number;
  pageHeightMm: number;
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

const PAPER_SIZE_MM: Record<
  PaperType,
  { widthMm: number; heightMm: number | null }
> = {
  a4: { widthMm: 210, heightMm: 297 },
  letter: { widthMm: 216, heightMm: 279 },
  'continuous-58': { widthMm: 58, heightMm: null },
  'continuous-80': { widthMm: 80, heightMm: null },
  'continuous-100': { widthMm: 100, heightMm: null },
};

const DEFAULT_MARGIN_MM = 5;
const DEFAULT_GAP_MM = 2;

@Injectable()
export class AppService {
  parseContent(content: string) {
    const normalized = content.replace(/\r/g, '');
    const lines = normalized
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return {
        records: [],
        errors: ['No se recibió contenido para interpretar.'],
      };
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
      if (
        discountPrice !== null &&
        (!Number.isFinite(discountPrice) || discountPrice < 0)
      ) {
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

  buildPreview(body: {
    records: ParsedRecord[];
    template: string;
    codeType: string;
    copies: number;
  }) {
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

  preparePrint(labels: PreviewLabel[], settings: PrintSettings = {}) {
    const firstLabel = labels[0];
    const paperType = settings.paperType ?? 'a4';
    const orientation = settings.orientation ?? 'portrait';
    const isContinuous = paperType.startsWith('continuous');
    const hasZeroMarginConfigured =
      Number(settings.marginTopMm) === 0 ||
      Number(settings.marginBottomMm) === 0 ||
      Number(settings.marginLeftMm) === 0 ||
      Number(settings.marginRightMm) === 0;
    const allowZeroMarginOnContinuous =
      isContinuous &&
      (settings.allowZeroMarginOnContinuous === true || hasZeroMarginConfigured);
    const marginMin = allowZeroMarginOnContinuous ? 0 : DEFAULT_MARGIN_MM;
    const marginTopMm = this.resolveMarginMm(settings.marginTopMm, marginMin);
    const marginBottomMm = this.resolveMarginMm(
      settings.marginBottomMm,
      marginMin,
    );
    const marginLeftMm = this.resolveMarginMm(settings.marginLeftMm, marginMin);
    const marginRightMm = this.resolveMarginMm(
      settings.marginRightMm,
      marginMin,
    );
    const gapHorizontalMm = this.resolveGapMm(settings.gapHorizontalMm);
    const gapVerticalMm = this.resolveGapMm(settings.gapVerticalMm);
    const labelWidthMm =
      firstLabel?.templateWidthMm ?? TEMPLATE_SIZES.standard.widthMm;
    const labelHeightMm =
      firstLabel?.templateHeightMm ?? TEMPLATE_SIZES.standard.heightMm;
    const paperSize = this.resolvePaperSize(paperType, orientation);
    const maxColumns = this.calculateMaxColumns({
      paperWidthMm: paperSize.widthMm,
      marginLeftMm,
      marginRightMm,
      gapHorizontalMm,
      labelWidthMm,
    });
    const columns = this.resolveColumns(settings.columns, maxColumns);
    const rowsPerPage = this.calculateRowsPerPage({
      paperType,
      paperHeightMm: paperSize.heightMm,
      marginTopMm,
      marginBottomMm,
      gapVerticalMm,
      labelHeightMm,
      labelsCount: labels.length,
      columns,
    });
    const itemsPerPage = Math.max(1, columns * rowsPerPage);
    const pageCount = Math.max(1, Math.ceil(labels.length / itemsPerPage));
    const pageHeightMm = this.calculatePageHeightMm({
      paperType,
      paperHeightMm: paperSize.heightMm,
      marginTopMm,
      marginBottomMm,
      gapVerticalMm,
      labelHeightMm,
      labelsCount: labels.length,
      columns,
      rowsPerPage,
    });

    return {
      status: 'ready-for-print',
      printDocument: {
        title: 'Etiquetas listas para imprimir',
        template: firstLabel?.template ?? 'standard',
        widthMm: labelWidthMm,
        heightMm: labelHeightMm,
        paperType,
        orientation,
        marginTopMm,
        marginBottomMm,
        marginLeftMm,
        marginRightMm,
        gapHorizontalMm,
        gapVerticalMm,
        columns,
        rowsPerPage,
        itemsPerPage,
        pageCount,
        pageHeightMm,
        labels,
        generatedAt: new Date().toISOString(),
      } satisfies PrintDocument,
    };
  }

  private tokenize(line: string) {
    if (line.includes('\t')) {
      return line
        .split('\t')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (line.includes(',')) {
      return line
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    return line
      .split(/\s+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private looksLikeHeader(tokens: string[]) {
    const normalized = tokens.map((token) => token.toLowerCase());
    const headerTerms = [
      'nombre',
      'name',
      'producto',
      'codigo',
      'code',
      'sku',
      'precio',
      'price',
      'valor',
      'descuento',
      'discount',
    ];
    return (
      normalized.length > 0 &&
      normalized.every((token) => headerTerms.includes(token))
    );
  }

  private parseHeaderRow(values: string[], header: string[]) {
    return {
      name: this.readField(values, header, ['nombre', 'name', 'producto']),
      code: this.readField(values, header, ['codigo', 'code', 'sku']),
      priceValue: this.readField(values, header, ['precio', 'price', 'valor']),
      discountValue: this.readField(values, header, [
        'descuento',
        'discount',
        'discountprice',
      ]),
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
    const headerIndex = header.findIndex((field) =>
      aliases.includes(field.toLowerCase()),
    );
    if (headerIndex >= 0 && values[headerIndex]) {
      return values[headerIndex];
    }

    return '';
  }

  private resolveGapMm(value: number | undefined) {
    const gap = Number(value);
    if (!Number.isFinite(gap)) {
      return DEFAULT_GAP_MM;
    }

    return Math.min(Math.max(gap, 0), 20);
  }

  private resolveMarginMm(value: number | undefined, minMargin: number) {
    const requestedMargin = Number(value);
    if (!Number.isFinite(requestedMargin)) {
      return minMargin;
    }
    return Math.min(Math.max(requestedMargin, minMargin), 25);
  }

  private resolveColumns(value: number | undefined, maxColumns: number) {
    const requestedColumns = Number(value);
    if (!Number.isFinite(requestedColumns)) {
      return Math.max(1, maxColumns);
    }
    return Math.max(1, Math.min(Math.floor(requestedColumns), maxColumns));
  }

  private resolvePaperSize(
    paperType: PaperType,
    orientation: PrintOrientation,
  ): { widthMm: number; heightMm: number | null } {
    const paperSize = PAPER_SIZE_MM[paperType];
    if (paperSize.heightMm === null || orientation === 'portrait') {
      return paperSize;
    }

    return {
      widthMm: paperSize.heightMm,
      heightMm: paperSize.widthMm,
    };
  }

  private calculateMaxColumns(args: {
    paperWidthMm: number;
    marginLeftMm: number;
    marginRightMm: number;
    gapHorizontalMm: number;
    labelWidthMm: number;
  }) {
    const contentWidthMm = Math.max(
      0,
      args.paperWidthMm - args.marginLeftMm - args.marginRightMm,
    );
    const slotWidthMm = args.labelWidthMm + args.gapHorizontalMm;

    if (slotWidthMm <= 0) {
      return 1;
    }

    return Math.max(
      1,
      Math.floor((contentWidthMm + args.gapHorizontalMm) / slotWidthMm),
    );
  }

  private calculateRowsPerPage(args: {
    paperType: PaperType;
    paperHeightMm: number | null;
    marginTopMm: number;
    marginBottomMm: number;
    gapVerticalMm: number;
    labelHeightMm: number;
    labelsCount: number;
    columns: number;
  }) {
    if (
      args.paperType.startsWith('continuous') ||
      args.paperHeightMm === null
    ) {
      return Math.max(
        1,
        Math.ceil(args.labelsCount / Math.max(1, args.columns)),
      );
    }

    const contentHeightMm = Math.max(
      0,
      args.paperHeightMm - args.marginTopMm - args.marginBottomMm,
    );
    const slotHeightMm = args.labelHeightMm + args.gapVerticalMm;
    if (slotHeightMm <= 0) {
      return 1;
    }

    const estimated = Math.floor(
      (contentHeightMm + args.gapVerticalMm) / slotHeightMm,
    );
    return Math.max(1, estimated);
  }

  private calculatePageHeightMm(args: {
    paperType: PaperType;
    paperHeightMm: number | null;
    marginTopMm: number;
    marginBottomMm: number;
    gapVerticalMm: number;
    labelHeightMm: number;
    labelsCount: number;
    columns: number;
    rowsPerPage: number;
  }) {
    if (
      !args.paperType.startsWith('continuous') &&
      args.paperHeightMm !== null
    ) {
      return args.paperHeightMm;
    }

    const usedRows = Math.max(
      1,
      Math.min(
        args.rowsPerPage,
        Math.ceil(args.labelsCount / Math.max(1, args.columns)),
      ),
    );
    const labelsHeightMm = usedRows * args.labelHeightMm;
    const gapsHeightMm = Math.max(0, usedRows - 1) * args.gapVerticalMm;
    return Number(
      (
        args.marginTopMm +
        args.marginBottomMm +
        labelsHeightMm +
        gapsHeightMm
      ).toFixed(2),
    );
  }
}
