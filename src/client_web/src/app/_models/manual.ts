export interface Manual {
  documents: Document[];
}

export interface Document {
  name: string;
  title: string;
  subtitle?: string;
  summary?: string;
  sections?: Section[];
}

export interface Section {
  title: string;
  titleHtml?: string;
  underLevelColor?: string;
  description?: any[];  // sometimes string, sometimes string[], sometimes Media
  section?: Section[];
}

export interface Media {
  type: string;
  src: string;
}
