import { Character } from './../character';
interface CharacterFormRoot {
  characterFormSections: FormSection[];
}

export interface Field {
  title: string;
  type: string;
  description: string;
  hint: string;
  bind: string;
}

export interface FormSection extends Field {
  fields: Field[];
}

export interface Input extends Field {
  hint: string;
}

export interface Textbox extends Field {
  lines: number;
}

export interface Dropdown extends Field {
  options: DropdownOption[];
  multiSelect: boolean;
  action: (selection: any) => any;
}

export interface Button extends Field {
  action: ButtonActions;
}

export enum ButtonActions {
  Submit = 'Submit'
}

export interface DropdownOption {
  label: string;
  value: any;
}

export class CharacterContainer {
  public constructor(character: Character, submitFct: () => void) {
    this.character = character;
    this.submitFct = submitFct;
  }
  character: Character;
  submitFct: () => void;
}
