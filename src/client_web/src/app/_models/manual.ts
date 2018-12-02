export interface Manual {
  documents: Document[];
}

export interface Document {
  name: string;
  title: string;
  sections?: Section[];
}

export interface Section {
  title: string;
  title_html?: string;
  under_level_color?: string;
  description?: any[];  // sometimes string, sometimes string[], sometimes Media
  section?: Section[];
}

export interface Media {
  type: string;
  src: string;
}
