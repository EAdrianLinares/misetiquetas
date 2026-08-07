import type { PaperProfile, PaperType, PrintSettings } from '../types';

export interface LayoutPlan {
  paperWidthMm: number;
  paperHeightMm: number;
  columns: number;
  rowsPerPage: number;
  itemsPerPage: number;
  pageCount: number;
}

const PAPER_SIZE_MM: Record<PaperType, { widthMm: number; heightMm: number | null }> = {
  a4: { widthMm: 210, heightMm: 297 },
  letter: { widthMm: 216, heightMm: 279 },
  'continuous-58': { widthMm: 58, heightMm: null },
  'continuous-80': { widthMm: 80, heightMm: null },
  'continuous-100': { widthMm: 100, heightMm: null },
};

export const PAPER_PROFILES: PaperProfile[] = [
  {
    id: 'continuous-58-default',
    name: 'Continuo 58 mm',
    paperType: 'continuous-58',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: 5,
    marginBottomMm: 5,
    marginLeftMm: 5,
    marginRightMm: 5,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
  },
  {
    id: 'continuous-80-default',
    name: 'Continuo 80 mm',
    paperType: 'continuous-80',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: 5,
    marginBottomMm: 5,
    marginLeftMm: 5,
    marginRightMm: 5,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
  },
  {
    id: 'continuous-100-default',
    name: 'Continuo 100 mm',
    paperType: 'continuous-100',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: 5,
    marginBottomMm: 5,
    marginLeftMm: 5,
    marginRightMm: 5,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
  },
  {
    id: 'continuous-100-2-columns',
    name: 'Continuo 100 mm - 2 columnas',
    paperType: 'continuous-100',
    orientation: 'portrait',
    columns: 2,
    marginTopMm: 0,
    marginBottomMm: 0,
    marginLeftMm: 0,
    marginRightMm: 0,
    gapHorizontalMm: 0,
    gapVerticalMm: 2,
  },
];

export function buildPrintSettings(input: {
  profile: PaperProfile;
  customSettings?: Partial<PrintSettings>;
  allowZeroMarginOnContinuous: boolean;
}): PrintSettings {
  const base = input.profile;
  const custom = input.customSettings ?? {};
  const paperType = base.isCustom ? custom.paperType ?? base.paperType : base.paperType;
  const orientation = base.isCustom ? custom.orientation ?? base.orientation : base.orientation;
  const columnsSource = base.isCustom ? custom.columns ?? base.columns : base.columns;
  const isContinuous = paperType !== 'a4' && paperType !== 'letter';
  const minMargin = isContinuous && input.allowZeroMarginOnContinuous ? 0 : 5;

  return {
    paperType,
    orientation,
    columns: clampNumber(columnsSource, 1, 4, 1),
    marginTopMm: clampNumber(base.isCustom ? custom.marginTopMm ?? base.marginTopMm : base.marginTopMm, minMargin, 25, 5),
    marginBottomMm: clampNumber(
      base.isCustom ? custom.marginBottomMm ?? base.marginBottomMm : base.marginBottomMm,
      minMargin,
      25,
      5,
    ),
    marginLeftMm: clampNumber(base.isCustom ? custom.marginLeftMm ?? base.marginLeftMm : base.marginLeftMm, minMargin, 25, 5),
    marginRightMm: clampNumber(
      base.isCustom ? custom.marginRightMm ?? base.marginRightMm : base.marginRightMm,
      minMargin,
      25,
      5,
    ),
    gapHorizontalMm: clampNumber(
      base.isCustom ? custom.gapHorizontalMm ?? base.gapHorizontalMm : base.gapHorizontalMm,
      0,
      20,
      2,
    ),
    gapVerticalMm: clampNumber(
      base.isCustom ? custom.gapVerticalMm ?? base.gapVerticalMm : base.gapVerticalMm,
      0,
      20,
      2,
    ),
    allowZeroMarginOnContinuous: input.allowZeroMarginOnContinuous,
  };
}

export function buildLayoutPlan(args: {
  labelWidthMm: number;
  labelHeightMm: number;
  totalItems: number;
  settings: PrintSettings;
}): LayoutPlan {
  const paperSize = resolvePaperSize(args.settings.paperType, args.settings.orientation);
  const maxColumns = calculateMaxColumns({
    paperWidthMm: paperSize.widthMm,
    marginLeftMm: args.settings.marginLeftMm,
    marginRightMm: args.settings.marginRightMm,
    gapHorizontalMm: args.settings.gapHorizontalMm,
    labelWidthMm: args.labelWidthMm,
  });
  const columns = Math.max(1, Math.min(args.settings.columns, maxColumns));
  const rowsPerPage = calculateRowsPerPage({
    paperType: args.settings.paperType,
    paperHeightMm: paperSize.heightMm,
    marginTopMm: args.settings.marginTopMm,
    marginBottomMm: args.settings.marginBottomMm,
    gapVerticalMm: args.settings.gapVerticalMm,
    labelHeightMm: args.labelHeightMm,
    columns,
    totalItems: args.totalItems,
  });
  const itemsPerPage = Math.max(1, columns * rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(args.totalItems / itemsPerPage));
  const paperHeightMm =
    paperSize.heightMm === null
      ? buildContinuousHeightMm({
          marginTopMm: args.settings.marginTopMm,
          marginBottomMm: args.settings.marginBottomMm,
          gapVerticalMm: args.settings.gapVerticalMm,
          labelHeightMm: args.labelHeightMm,
          rows: rowsPerPage,
        })
      : paperSize.heightMm;

  return {
    paperWidthMm: paperSize.widthMm,
    paperHeightMm,
    columns,
    rowsPerPage,
    itemsPerPage,
    pageCount,
  };
}

function resolvePaperSize(paperType: PaperType, orientation: 'portrait' | 'landscape') {
  const paper = PAPER_SIZE_MM[paperType];
  if (paper.heightMm === null || orientation === 'portrait') {
    return paper;
  }

  return {
    widthMm: paper.heightMm,
    heightMm: paper.widthMm,
  };
}

function calculateMaxColumns(args: {
  paperWidthMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  labelWidthMm: number;
}) {
  const contentWidthMm = Math.max(0, args.paperWidthMm - args.marginLeftMm - args.marginRightMm);
  const slotWidthMm = args.labelWidthMm + args.gapHorizontalMm;
  if (slotWidthMm <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor((contentWidthMm + args.gapHorizontalMm) / slotWidthMm));
}

function calculateRowsPerPage(args: {
  paperType: PaperType;
  paperHeightMm: number | null;
  marginTopMm: number;
  marginBottomMm: number;
  gapVerticalMm: number;
  labelHeightMm: number;
  columns: number;
  totalItems: number;
}) {
  if (args.paperType.startsWith('continuous') || args.paperHeightMm === null) {
    return Math.max(1, Math.ceil(args.totalItems / Math.max(1, args.columns)));
  }

  const contentHeightMm = Math.max(0, args.paperHeightMm - args.marginTopMm - args.marginBottomMm);
  const slotHeightMm = args.labelHeightMm + args.gapVerticalMm;
  if (slotHeightMm <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor((contentHeightMm + args.gapVerticalMm) / slotHeightMm));
}

function buildContinuousHeightMm(args: {
  marginTopMm: number;
  marginBottomMm: number;
  gapVerticalMm: number;
  labelHeightMm: number;
  rows: number;
}) {
  const labelsHeightMm = args.rows * args.labelHeightMm;
  const gapsHeightMm = Math.max(0, args.rows - 1) * args.gapVerticalMm;
  return Number((args.marginTopMm + args.marginBottomMm + labelsHeightMm + gapsHeightMm).toFixed(2));
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.min(Math.max(numericValue, min), max);
}

export function paginate<T>(items: T[], pageSize: number) {
  const normalizedPageSize = Math.max(1, pageSize);
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += normalizedPageSize) {
    pages.push(items.slice(index, index + normalizedPageSize));
  }
  return pages;
}
