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

export interface PrintResponse {
  status: string;
  printDocument: PrintDocument;
}
