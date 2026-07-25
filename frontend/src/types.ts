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
