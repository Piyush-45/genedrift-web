export type FieldKind =
  | "text"
  | "longtext"
  | "select"
  | "boolean"
  | "number"
  | "textlist"
  | "grouplist";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  options?: string[];
  fields?: FieldSpec[];
  titleKey?: string;
  maxItems?: number;
  help?: string;
}

export interface SectionSpec {
  label: string;
  fields: FieldSpec[];
}

export interface FieldSpecFile {
  generatedAt: string;
  sections: Record<string, SectionSpec>;
}

/** A row from Website_Pages. */
export interface PageRecord {
  id: string;
  pageUuid: string;
  path: string;
  internalTitle: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  lastPublishedAt: string;
}

/** A row from Website_Sections. */
export interface SectionRecord {
  id: string;
  sectionUuid: string;
  pageId: string;
  displayOrder: number;
  sectionType: string;
  /** Parsed from the Section_Data text field. */
  data: Record<string, unknown>;
  /** The raw text, kept so an unparseable value is never silently discarded. */
  rawData: string;
  parseError: string | null;
  hidden: boolean;
  isRequired: boolean;
}
