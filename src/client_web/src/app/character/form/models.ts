interface CharacterFormRoot {
  characterFormSections: FormSection[];
}

interface Field {
  title: string;
  type: string;
  description: string;
  hint: string;
  bind: string;
}

interface FormSection extends Field {
  fields: Field[];
}

interface Input extends Field {
  hint: string;
}

interface Textbox extends Field {
  lines: number;
}

interface Dropdown extends Field {
  options: DropdownOption[];
  multiSelect: boolean;
  action: (selection: any) => any;
}

interface Button extends Field {
  action: () => any;
}

interface DropdownOption {
  label: string;
  value: any;
}
