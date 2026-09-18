export type PaperType =
  | 'a4'
  | 'letter'
  | 'continuous-58'
  | 'continuous-80'
  | 'continuous-100';

export type PrintOrientation = 'portrait' | 'landscape';

/**
 * Qué hacer cuando la etiqueta de la plantilla no coincide con el ancho
 * imprimible del papel:
 * - contain: se reduce proporcionalmente sólo si no cabe (por defecto).
 * - fill: se ajusta siempre al ancho disponible (reduce o amplía).
 * - none: se respeta el tamaño exacto aunque se recorte al imprimir.
 */
export type LabelFitMode = 'contain' | 'fill' | 'none';

/**
 * Longitud de página en papel continuo:
 * - content: una sola página del alto exacto del lote (menos papel).
 * - label: una etiqueta por página; requiere un papel a medida en el driver.
 * - fixed: longitud fija en mm, para igualar el papel que declara el driver.
 */
export type ContinuousPageMode = 'content' | 'label' | 'fixed';

export interface PaperProfile {
  id: string;
  name: string;
  paperType: PaperType;
  orientation: PrintOrientation;
  columns: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  labelFitMode?: LabelFitMode;
  continuousPageMode?: ContinuousPageMode;
  /** Longitud de página en mm; sólo se usa con `continuousPageMode: 'fixed'`. */
  pageLengthMm?: number;
  isCustom?: boolean;
}

export interface PrintSettings {
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
  /** Sólo se usa con `continuousPageMode: 'fixed'`. */
  pageLengthMm: number;
  allowZeroMarginOnContinuous: boolean;
}
