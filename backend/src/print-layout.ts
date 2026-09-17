export type PaperType =
  | 'a4'
  | 'letter'
  | 'continuous-58'
  | 'continuous-80'
  | 'continuous-100';

export type PrintOrientation = 'portrait' | 'landscape';

/** Ver `frontend/src/types.ts`: contain ajusta sólo si no cabe, fill siempre, none nunca. */
export type LabelFitMode = 'contain' | 'fill' | 'none';

/**
 * Ver `frontend/src/types.ts`: content agrupa el lote en una página del alto
 * exacto, label deja una etiqueta por página, fixed iguala el papel del driver.
 */
export type ContinuousPageMode = 'content' | 'label' | 'fixed';

export interface PrintSettingsInput {
  paperType?: PaperType;
  orientation?: PrintOrientation;
  columns?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  gapHorizontalMm?: number;
  gapVerticalMm?: number;
  labelFitMode?: LabelFitMode;
  continuousPageMode?: ContinuousPageMode;
  /** Longitud de página en mm; sólo se usa con `continuousPageMode: 'fixed'`. */
  pageLengthMm?: number;
  allowZeroMarginOnContinuous?: boolean;
}

export interface ResolvedPrintSettings {
  paperType: PaperType;
  orientation: PrintOrientation;
  columns: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  labelFitMode: LabelFitMode;
  continuousPageMode: ContinuousPageMode;
  pageLengthMm: number;
  allowZeroMarginOnContinuous: boolean;
}

export interface LayoutPlan {
  paperWidthMm: number;
  paperHeightMm: number;
  printableWidthMm: number;
  printableHeightMm: number | null;
  slotWidthMm: number;
  columns: number;
  rowsPerPage: number;
  itemsPerPage: number;
  pageCount: number;
  labelWidthMm: number;
  labelHeightMm: number;
  requestedLabelWidthMm: number;
  requestedLabelHeightMm: number;
  labelScale: number;
  isContinuous: boolean;
  warnings: string[];
}

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

const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  a4: 'A4',
  letter: 'Carta',
  'continuous-58': 'Continuo 58 mm',
  'continuous-80': 'Continuo 80 mm',
  'continuous-100': 'Continuo 100 mm',
};

const MAX_COLUMNS = 4;
const MIN_SLOT_WIDTH_MM = 18;
const MAX_MARGIN_MM = 25;
const DEFAULT_MARGIN_MM = 5;
const MAX_PAGE_LENGTH_MM = 1200;
/** Longitud declarada por la mayoría de drivers POS de 58/80 mm. */
const DEFAULT_CONTINUOUS_PAGE_LENGTH_MM = 210;

export function isContinuousPaper(paperType: PaperType) {
  return paperType.startsWith('continuous');
}

export function resolvePrintSettings(
  raw: PrintSettingsInput = {},
): ResolvedPrintSettings {
  const paperType = PAPER_SIZE_MM[raw.paperType as PaperType]
    ? (raw.paperType as PaperType)
    : 'a4';
  const isContinuous = isContinuousPaper(paperType);
  // Las reglas de margen mínimo pertenecen al perfil elegido en la UI; aquí sólo
  // se acotan los valores a un rango imprimible.
  const minMargin = 0;

  return {
    paperType,
    orientation: raw.orientation === 'landscape' ? 'landscape' : 'portrait',
    columns: clamp(raw.columns, 1, MAX_COLUMNS, 1),
    marginTopMm: clamp(
      raw.marginTopMm,
      minMargin,
      MAX_MARGIN_MM,
      DEFAULT_MARGIN_MM,
    ),
    marginBottomMm: clamp(
      raw.marginBottomMm,
      minMargin,
      MAX_MARGIN_MM,
      DEFAULT_MARGIN_MM,
    ),
    marginLeftMm: clamp(
      raw.marginLeftMm,
      minMargin,
      MAX_MARGIN_MM,
      DEFAULT_MARGIN_MM,
    ),
    marginRightMm: clamp(
      raw.marginRightMm,
      minMargin,
      MAX_MARGIN_MM,
      DEFAULT_MARGIN_MM,
    ),
    gapHorizontalMm: clamp(raw.gapHorizontalMm, 0, 20, 2),
    gapVerticalMm: clamp(raw.gapVerticalMm, 0, 20, 2),
    labelFitMode:
      raw.labelFitMode === 'fill' || raw.labelFitMode === 'none'
        ? raw.labelFitMode
        : 'contain',
    continuousPageMode: normalizePageMode(
      isContinuous ? raw.continuousPageMode : 'content',
    ),
    pageLengthMm: normalizePageLengthMm(raw.pageLengthMm),
    allowZeroMarginOnContinuous:
      isContinuous && raw.allowZeroMarginOnContinuous === true,
  };
}

function normalizePageMode(
  value: ContinuousPageMode | undefined,
): ContinuousPageMode {
  return value === 'label' || value === 'fixed' ? value : 'content';
}

function normalizePageLengthMm(value: number | undefined) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DEFAULT_CONTINUOUS_PAGE_LENGTH_MM;
  }
  return Math.min(Math.round(numericValue), MAX_PAGE_LENGTH_MM);
}

/**
 * Calcula columnas, filas, páginas y el tamaño real de la etiqueta.
 *
 * Réplica de `frontend/src/utils/printLayout.ts`: ambos lados deben producir
 * los mismos números para que la vista previa coincida con lo impreso.
 */
export function buildLayoutPlan(args: {
  labelWidthMm: number;
  labelHeightMm: number;
  totalItems: number;
  settings: ResolvedPrintSettings;
}): LayoutPlan {
  const settings = args.settings;
  const paperSize = resolvePaperSize(settings.paperType, settings.orientation);
  const isContinuous =
    isContinuousPaper(settings.paperType) || paperSize.heightMm === null;
  const warnings: string[] = [];

  const requestedLabelWidthMm = Math.max(1, args.labelWidthMm);
  const requestedLabelHeightMm = Math.max(1, args.labelHeightMm);
  const printableWidthMm = roundMm(
    Math.max(
      0,
      paperSize.widthMm - settings.marginLeftMm - settings.marginRightMm,
    ),
  );
  // En papel de hoja la altura la fija el formato. En continuo la decide el modo
  // de página: 'fixed' iguala el papel del driver y el resto se deriva del
  // contenido, que es lo que menos papel gasta.
  const fixedPageLengthMm =
    paperSize.heightMm ??
    (settings.continuousPageMode === 'fixed' && settings.pageLengthMm > 0
      ? settings.pageLengthMm
      : null);
  const printableHeightMm =
    fixedPageLengthMm === null
      ? null
      : roundMm(
          Math.max(
            0,
            fixedPageLengthMm - settings.marginTopMm - settings.marginBottomMm,
          ),
        );

  const requestedColumns = clamp(settings.columns, 1, MAX_COLUMNS, 1);
  let columns = requestedColumns;
  let slotWidthMm = calculateSlotWidthMm(
    printableWidthMm,
    columns,
    settings.gapHorizontalMm,
  );
  while (columns > 1 && slotWidthMm < MIN_SLOT_WIDTH_MM) {
    columns -= 1;
    slotWidthMm = calculateSlotWidthMm(
      printableWidthMm,
      columns,
      settings.gapHorizontalMm,
    );
  }
  if (columns !== requestedColumns) {
    warnings.push(
      `El papel de ${paperSize.widthMm} mm no admite ${requestedColumns} columnas; se imprimirá en ${columns}.`,
    );
  }

  const labelScale = calculateLabelScale({
    fitMode: settings.labelFitMode,
    slotWidthMm,
    printableHeightMm,
    requestedLabelWidthMm,
    requestedLabelHeightMm,
  });
  const labelWidthMm = floorMm(requestedLabelWidthMm * labelScale);
  const labelHeightMm = floorMm(requestedLabelHeightMm * labelScale);

  if (
    settings.labelFitMode === 'none' &&
    requestedLabelWidthMm > slotWidthMm + 0.01
  ) {
    warnings.push(
      `La etiqueta de ${roundMm(requestedLabelWidthMm)} mm no cabe en los ${roundMm(slotWidthMm)} mm disponibles y se recortará al imprimir.`,
    );
  } else if (labelScale < 0.999) {
    warnings.push(
      `La etiqueta se redujo a ${labelWidthMm} × ${labelHeightMm} mm (${Math.round(labelScale * 100)}%) para caber en ${PAPER_TYPE_LABELS[settings.paperType]}.`,
    );
  } else if (labelScale > 1.001) {
    warnings.push(
      `La etiqueta se amplió a ${labelWidthMm} × ${labelHeightMm} mm (${Math.round(labelScale * 100)}%) para aprovechar el ancho del papel.`,
    );
  }

  const totalItems = Math.max(0, args.totalItems);
  const rowsPerPage = calculateRowsPerPage({
    printableHeightMm,
    gapVerticalMm: settings.gapVerticalMm,
    labelHeightMm,
    contentRows:
      settings.continuousPageMode === 'content'
        ? Math.ceil(Math.max(1, totalItems) / columns)
        : 1,
  });
  const itemsPerPage = Math.max(1, columns * rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // Ver `frontend/src/utils/printLayout.ts`: con longitud fija se respeta la del
  // driver; si no, se deriva del contenido y se redondea hacia arriba porque los
  // drivers sólo aceptan tamaños enteros.
  const requestedPageHeightMm =
    fixedPageLengthMm ??
    Math.ceil(
      settings.marginTopMm +
        settings.marginBottomMm +
        labelHeightMm * rowsPerPage +
        settings.gapVerticalMm * Math.max(0, rowsPerPage - 1),
    );
  // Ver `frontend/src/utils/printLayout.ts`: si el ancho supera al alto, CSS
  // considera la página horizontal y el driver rota la etiqueta.
  const minPortraitHeightMm = Math.ceil(paperSize.widthMm) + 1;
  const paperHeightMm =
    isContinuous && requestedPageHeightMm < minPortraitHeightMm
      ? minPortraitHeightMm
      : requestedPageHeightMm;

  if (paperHeightMm !== requestedPageHeightMm) {
    warnings.push(
      `La página se alargó de ${requestedPageHeightMm} a ${paperHeightMm} mm para que no salga girada: una página más ancha que alta se imprime en horizontal.`,
    );
  }

  if (isContinuous && printableHeightMm !== null && labelHeightMm > printableHeightMm) {
    warnings.push(
      `La etiqueta de ${labelHeightMm} mm de alto no cabe en una página de ${fixedPageLengthMm} mm; reduce los márgenes o aumenta la longitud de página.`,
    );
  }

  return {
    paperWidthMm: paperSize.widthMm,
    paperHeightMm,
    printableWidthMm,
    printableHeightMm,
    slotWidthMm: roundMm(slotWidthMm),
    columns,
    rowsPerPage,
    itemsPerPage,
    pageCount,
    labelWidthMm,
    labelHeightMm,
    requestedLabelWidthMm: roundMm(requestedLabelWidthMm),
    requestedLabelHeightMm: roundMm(requestedLabelHeightMm),
    labelScale,
    isContinuous,
    warnings,
  };
}

function calculateSlotWidthMm(
  printableWidthMm: number,
  columns: number,
  gapHorizontalMm: number,
) {
  const normalizedColumns = Math.max(1, columns);
  const totalGapMm = gapHorizontalMm * (normalizedColumns - 1);
  return Math.max(0, (printableWidthMm - totalGapMm) / normalizedColumns);
}

function calculateLabelScale(args: {
  fitMode: LabelFitMode;
  slotWidthMm: number;
  printableHeightMm: number | null;
  requestedLabelWidthMm: number;
  requestedLabelHeightMm: number;
}) {
  if (args.fitMode === 'none' || args.slotWidthMm <= 0) {
    return 1;
  }

  const widthRatio = args.slotWidthMm / args.requestedLabelWidthMm;
  const heightRatio =
    args.printableHeightMm === null || args.printableHeightMm <= 0
      ? Number.POSITIVE_INFINITY
      : args.printableHeightMm / args.requestedLabelHeightMm;
  const ratio = Math.min(widthRatio, heightRatio);

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 1;
  }

  return (
    Math.floor(
      (args.fitMode === 'fill' ? ratio : Math.min(1, ratio)) * 1000,
    ) / 1000
  );
}

function calculateRowsPerPage(args: {
  printableHeightMm: number | null;
  gapVerticalMm: number;
  labelHeightMm: number;
  contentRows: number;
}) {
  // Sin altura de página fija manda el contenido: el papel avanza justo lo que
  // ocupan las etiquetas y ninguna fila queda partida.
  if (args.printableHeightMm === null) {
    return Math.max(1, args.contentRows);
  }

  const slotHeightMm = args.labelHeightMm + args.gapVerticalMm;
  if (slotHeightMm <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor((args.printableHeightMm + args.gapVerticalMm) / slotHeightMm),
  );
}

function resolvePaperSize(
  paperType: PaperType,
  orientation: PrintOrientation,
): { widthMm: number; heightMm: number | null } {
  const paperSize = PAPER_SIZE_MM[paperType] ?? PAPER_SIZE_MM.a4;
  if (paperSize.heightMm === null || orientation === 'portrait') {
    return paperSize;
  }

  return {
    widthMm: paperSize.heightMm,
    heightMm: paperSize.widthMm,
  };
}

function roundMm(value: number) {
  return Math.round(value * 100) / 100;
}

function floorMm(value: number) {
  return Math.floor(value * 100) / 100;
}

function clamp(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.min(Math.max(numericValue, min), max);
}
