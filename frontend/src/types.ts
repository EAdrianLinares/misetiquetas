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
  | 'a4'
  | 'letter'
  | 'continuous-58'
  | 'continuous-80'
  | 'continuous-100';

export type PrintOrientation = 'portrait' | 'landscape';

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
  allowZeroMarginOnContinuous: boolean;
}

export interface PrintDocument {
  title: string;
  template: string;
  widthMm: number;
  heightMm: number;
  paperType: PaperType;
  orientation: PrintOrientation;
  columns: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  gapHorizontalMm: number;
  gapVerticalMm: number;
  rowsPerPage: number;
  itemsPerPage: number;
  pageCount: number;
  pageHeightMm: number;
  labels: PreviewLabel[];
  generatedAt: string;
}

export interface PrintResponse {
  status: string;
  printDocument: PrintDocument;
}
