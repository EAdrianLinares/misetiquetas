import type { ContinuousPageMode, LabelFitMode, PaperProfile, PaperType, PrintOrientation, PrintSettings } from '../types';

export interface LayoutPlan {
  paperWidthMm: number;
  paperHeightMm: number;
  printableWidthMm: number;
  printableHeightMm: number | null;
  /** Ancho disponible para una etiqueta dentro de su columna. */
  slotWidthMm: number;
  columns: number;
  rowsPerPage: number;
  itemsPerPage: number;
  pageCount: number;
  /** Tamaño real de impresión de cada etiqueta. */
  labelWidthMm: number;
  labelHeightMm: number;
  /** Tamaño pedido por la plantilla. */
  requestedLabelWidthMm: number;
  requestedLabelHeightMm: number;
  labelScale: number;
  isContinuous: boolean;
  warnings: string[];
}

const PAPER_SIZE_MM: Record<PaperType, { widthMm: number; heightMm: number | null }> = {
  a4: { widthMm: 210, heightMm: 297 },
  letter: { widthMm: 216, heightMm: 279 },
  'continuous-58': { widthMm: 58, heightMm: null },
  'continuous-80': { widthMm: 80, heightMm: null },
  'continuous-100': { widthMm: 100, heightMm: null },
};

export const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  a4: 'A4',
  letter: 'Carta',
  'continuous-58': 'Continuo 58 mm',
  'continuous-80': 'Continuo 80 mm',
  'continuous-100': 'Continuo 100 mm',
};

const MAX_COLUMNS = 4;
/** Por debajo de esto una etiqueta deja de ser legible; se reduce el número de columnas. */
const MIN_SLOT_WIDTH_MM = 18;
const MAX_MARGIN_MM = 25;
const DEFAULT_MARGIN_MM = 5;
/** Margen mínimo en rollo continuo: sólo lo necesario para la zona no imprimible. */
const CONTINUOUS_MARGIN_MM = 2;
/** Arriba basta 1 mm: el rollo ya viene cortado justo donde empieza la impresión. */
const CONTINUOUS_TOP_MARGIN_MM = 1;
/**
 * Longitud de página por defecto en rollo continuo. 210 mm es el tamaño que
 * declaran la mayoría de drivers POS de 58/80 mm; hacerla coincidir evita que la
 * impresora avance una página entera por etiqueta.
 */
const DEFAULT_CONTINUOUS_PAGE_LENGTH_MM = 210;
const MAX_PAGE_LENGTH_MM = 1200;

export function isContinuousPaper(paperType: PaperType) {
  return paperType.startsWith('continuous');
}

export const PAPER_PROFILES: PaperProfile[] = [
  {
    id: 'continuous-58-default',
    name: 'Continuo 58 mm',
    paperType: 'continuous-58',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: CONTINUOUS_TOP_MARGIN_MM,
    marginBottomMm: CONTINUOUS_MARGIN_MM,
    marginLeftMm: CONTINUOUS_MARGIN_MM,
    marginRightMm: CONTINUOUS_MARGIN_MM,
    gapHorizontalMm: 0,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
  },
  {
    id: 'continuous-80-default',
    name: 'Continuo 80 mm',
    paperType: 'continuous-80',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: CONTINUOUS_TOP_MARGIN_MM,
    marginBottomMm: CONTINUOUS_MARGIN_MM,
    marginLeftMm: CONTINUOUS_MARGIN_MM,
    marginRightMm: CONTINUOUS_MARGIN_MM,
    gapHorizontalMm: 0,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
  },
  {
    id: 'continuous-100-default',
    name: 'Continuo 100 mm',
    paperType: 'continuous-100',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: CONTINUOUS_TOP_MARGIN_MM,
    marginBottomMm: CONTINUOUS_MARGIN_MM,
    marginLeftMm: CONTINUOUS_MARGIN_MM,
    marginRightMm: CONTINUOUS_MARGIN_MM,
    gapHorizontalMm: 0,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
  },
  {
    id: 'continuous-100-2-columns',
    name: 'Continuo 100 mm - 2 columnas',
    paperType: 'continuous-100',
    orientation: 'portrait',
    columns: 2,
    marginTopMm: CONTINUOUS_TOP_MARGIN_MM,
    marginBottomMm: CONTINUOUS_MARGIN_MM,
    marginLeftMm: CONTINUOUS_MARGIN_MM,
    marginRightMm: CONTINUOUS_MARGIN_MM,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
  },
  {
    id: 'continuous-100-3-columns',
    name: 'Continuo 100 mm - 3 columnas',
    paperType: 'continuous-100',
    orientation: 'portrait',
    columns: 3,
    marginTopMm: CONTINUOUS_TOP_MARGIN_MM,
    marginBottomMm: CONTINUOUS_MARGIN_MM,
    marginLeftMm: CONTINUOUS_MARGIN_MM,
    marginRightMm: CONTINUOUS_MARGIN_MM,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
  },
  {
    id: 'letter-default',
    name: 'Carta',
    paperType: 'letter',
    orientation: 'portrait',
    columns: 2,
    marginTopMm: 10,
    marginBottomMm: 10,
    marginLeftMm: 10,
    marginRightMm: 10,
    gapHorizontalMm: 3,
    gapVerticalMm: 3,
    labelFitMode: 'contain',
  },
  {
    id: 'a4-default',
    name: 'A4',
    paperType: 'a4',
    orientation: 'portrait',
    columns: 2,
    marginTopMm: 10,
    marginBottomMm: 10,
    marginLeftMm: 10,
    marginRightMm: 10,
    gapHorizontalMm: 3,
    gapVerticalMm: 3,
    labelFitMode: 'contain',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    paperType: 'continuous-80',
    orientation: 'portrait',
    columns: 1,
    marginTopMm: DEFAULT_MARGIN_MM,
    marginBottomMm: DEFAULT_MARGIN_MM,
    marginLeftMm: DEFAULT_MARGIN_MM,
    marginRightMm: DEFAULT_MARGIN_MM,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
    labelFitMode: 'contain',
    isCustom: true,
  },
];

export function findPaperProfile(profileId: string) {
  return PAPER_PROFILES.find((profile) => profile.id === profileId) ?? PAPER_PROFILES[0];
}

/**
 * Resuelve los valores efectivos de impresión.
 *
 * Los perfiles predefinidos son de confianza: sus márgenes se respetan tal cual.
 * Sólo el perfil "Personalizado" aplica la regla de margen mínimo de 5 mm
 * (0 mm únicamente en papel continuo cuando el usuario lo habilita).
 */
export function buildPrintSettings(input: {
  profile: PaperProfile;
  customSettings?: Partial<PrintSettings>;
  allowZeroMarginOnContinuous: boolean;
}): PrintSettings {
  const base = input.profile;
  const isCustom = base.isCustom === true;
  const custom = isCustom ? input.customSettings ?? {} : {};
  const pick = <K extends keyof PrintSettings & keyof PaperProfile>(key: K) =>
    (custom[key] as PaperProfile[K] | undefined) ?? base[key];

  const paperType = (pick('paperType') ?? 'a4') as PaperType;
  const isContinuous = isContinuousPaper(paperType);
  const minMargin = isCustom ? (isContinuous && input.allowZeroMarginOnContinuous ? 0 : DEFAULT_MARGIN_MM) : 0;
  const margin = (key: 'marginTopMm' | 'marginBottomMm' | 'marginLeftMm' | 'marginRightMm') =>
    clampNumber(pick(key), minMargin, MAX_MARGIN_MM, Math.max(minMargin, DEFAULT_MARGIN_MM));

  return {
    paperType,
    orientation: (pick('orientation') ?? 'portrait') as PrintOrientation,
    columns: clampNumber(pick('columns'), 1, MAX_COLUMNS, 1),
    marginTopMm: margin('marginTopMm'),
    marginBottomMm: margin('marginBottomMm'),
    marginLeftMm: margin('marginLeftMm'),
    marginRightMm: margin('marginRightMm'),
    gapHorizontalMm: clampNumber(pick('gapHorizontalMm'), 0, 20, 2),
    gapVerticalMm: clampNumber(pick('gapVerticalMm'), 0, 20, 2),
    labelFitMode: normalizeFitMode(custom.labelFitMode ?? base.labelFitMode),
    continuousPageMode: normalizePageMode(
      isContinuous ? custom.continuousPageMode ?? base.continuousPageMode : 'content',
    ),
    pageLengthMm: normalizePageLengthMm(custom.pageLengthMm ?? base.pageLengthMm),
    allowZeroMarginOnContinuous: input.allowZeroMarginOnContinuous,
  };
}

/** Normaliza ajustes que ya vienen resueltos (por ejemplo, desde el backend) sin re-aplicar reglas de perfil. */
export function normalizePrintSettings(raw: Partial<PrintSettings>): PrintSettings {
  const paperType = (raw.paperType ?? 'a4') as PaperType;
  return {
    paperType,
    orientation: raw.orientation === 'landscape' ? 'landscape' : 'portrait',
    columns: clampNumber(raw.columns, 1, MAX_COLUMNS, 1),
    marginTopMm: clampNumber(raw.marginTopMm, 0, MAX_MARGIN_MM, DEFAULT_MARGIN_MM),
    marginBottomMm: clampNumber(raw.marginBottomMm, 0, MAX_MARGIN_MM, DEFAULT_MARGIN_MM),
    marginLeftMm: clampNumber(raw.marginLeftMm, 0, MAX_MARGIN_MM, DEFAULT_MARGIN_MM),
    marginRightMm: clampNumber(raw.marginRightMm, 0, MAX_MARGIN_MM, DEFAULT_MARGIN_MM),
    gapHorizontalMm: clampNumber(raw.gapHorizontalMm, 0, 20, 2),
    gapVerticalMm: clampNumber(raw.gapVerticalMm, 0, 20, 2),
    labelFitMode: normalizeFitMode(raw.labelFitMode),
    continuousPageMode: normalizePageMode(
      isContinuousPaper(paperType) ? raw.continuousPageMode : 'content',
    ),
    pageLengthMm: normalizePageLengthMm(raw.pageLengthMm),
    allowZeroMarginOnContinuous: raw.allowZeroMarginOnContinuous === true,
  };
}

function normalizePageMode(value: ContinuousPageMode | undefined): ContinuousPageMode {
  return value === 'label' || value === 'fixed' ? value : 'content';
}

function normalizePageLengthMm(value: number | undefined) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DEFAULT_CONTINUOUS_PAGE_LENGTH_MM;
  }
  return Math.min(Math.round(numericValue), MAX_PAGE_LENGTH_MM);
}

export function buildLayoutPlan(args: {
  labelWidthMm: number;
  labelHeightMm: number;
  totalItems: number;
  settings: PrintSettings;
}): LayoutPlan {
  const settings = args.settings;
  const paperSize = resolvePaperSize(settings.paperType, settings.orientation);
  const isContinuous = isContinuousPaper(settings.paperType) || paperSize.heightMm === null;
  const warnings: string[] = [];

  const requestedLabelWidthMm = Math.max(1, args.labelWidthMm);
  const requestedLabelHeightMm = Math.max(1, args.labelHeightMm);
  const printableWidthMm = roundMm(Math.max(0, paperSize.widthMm - settings.marginLeftMm - settings.marginRightMm));
  // En papel de hoja la altura la fija el formato. En continuo la decide el modo
  // de página: 'fixed' iguala el papel del driver y el resto se deriva del
  // contenido, que es lo que menos papel gasta.
  const fixedPageLengthMm =
    paperSize.heightMm ??
    (settings.continuousPageMode === 'fixed' && settings.pageLengthMm > 0 ? settings.pageLengthMm : null);
  const printableHeightMm =
    fixedPageLengthMm === null
      ? null
      : roundMm(Math.max(0, fixedPageLengthMm - settings.marginTopMm - settings.marginBottomMm));

  if (printableWidthMm <= 0) {
    warnings.push('Los márgenes laterales no dejan espacio imprimible; revisa la configuración del papel.');
  }

  const requestedColumns = clampNumber(settings.columns, 1, MAX_COLUMNS, 1);
  let columns = requestedColumns;
  let slotWidthMm = calculateSlotWidthMm(printableWidthMm, columns, settings.gapHorizontalMm);
  while (columns > 1 && slotWidthMm < MIN_SLOT_WIDTH_MM) {
    columns -= 1;
    slotWidthMm = calculateSlotWidthMm(printableWidthMm, columns, settings.gapHorizontalMm);
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

  if (settings.labelFitMode === 'none' && requestedLabelWidthMm > slotWidthMm + 0.01) {
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
    // Sin longitud fija, 'content' agrupa todo el lote en una página y 'label'
    // deja una fila por página.
    contentRows:
      settings.continuousPageMode === 'content' ? Math.ceil(Math.max(1, totalItems) / columns) : 1,
  });
  const itemsPerPage = Math.max(1, columns * rowsPerPage);
  const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // Con longitud fija se respeta la del driver. Si no, se deriva del contenido y
  // se redondea al milímetro superior, porque los drivers sólo aceptan enteros.
  const requestedPageHeightMm =
    fixedPageLengthMm ??
    Math.ceil(
      settings.marginTopMm +
        settings.marginBottomMm +
        labelHeightMm * rowsPerPage +
        settings.gapVerticalMm * Math.max(0, rowsPerPage - 1),
    );
  // CSS deduce la orientación comparando las dos medidas de `@page size`: si el
  // ancho supera al alto, la página es horizontal y el driver rota la etiqueta.
  // En continuo se alarga la página lo justo para que siga siendo vertical.
  const minPortraitHeightMm = Math.ceil(paperSize.widthMm) + 1;
  const paperHeightMm =
    isContinuous && requestedPageHeightMm < minPortraitHeightMm ? minPortraitHeightMm : requestedPageHeightMm;

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

function calculateSlotWidthMm(printableWidthMm: number, columns: number, gapHorizontalMm: number) {
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
  // En papel continuo el alto lo define el propio rollo, así que no limita.
  const heightRatio =
    args.printableHeightMm === null || args.printableHeightMm <= 0
      ? Number.POSITIVE_INFINITY
      : args.printableHeightMm / args.requestedLabelHeightMm;
  const ratio = Math.min(widthRatio, heightRatio);

  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 1;
  }

  // Se trunca para que el redondeo nunca devuelva una etiqueta más ancha que el hueco.
  return Math.floor((args.fitMode === 'fill' ? ratio : Math.min(1, ratio)) * 1000) / 1000;
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

  return Math.max(1, Math.floor((args.printableHeightMm + args.gapVerticalMm) / slotHeightMm));
}

function resolvePaperSize(paperType: PaperType, orientation: PrintOrientation) {
  const paper = PAPER_SIZE_MM[paperType] ?? PAPER_SIZE_MM.a4;
  if (paper.heightMm === null || orientation === 'portrait') {
    return paper;
  }

  return {
    widthMm: paper.heightMm,
    heightMm: paper.widthMm,
  };
}

function normalizeFitMode(value: LabelFitMode | undefined): LabelFitMode {
  return value === 'fill' || value === 'none' ? value : 'contain';
}

function roundMm(value: number) {
  return Math.round(value * 100) / 100;
}

function floorMm(value: number) {
  return Math.floor(value * 100) / 100;
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
