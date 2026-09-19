export interface NoteFile {
  id: string;
  name: string;
  rawContent: string;
  processedHtml: string;
  headings: HeadingItem[];
}

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  fileId: string;
}

export interface TOCNode {
  id: string;
  fileId: string;
  title: string;
  level: number;
  children: TOCNode[];
  isExpanded?: boolean;
}

export interface VaultStats {
  filesCount: number;
  headingsCount: number;
  equationsCount: number;
  calloutsCount: number;
}
