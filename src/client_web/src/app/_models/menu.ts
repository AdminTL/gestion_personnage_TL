export interface Menu {
  title: string;
  sibling: SubMenu[];
  grouped_sibling: SubMenu[];
}

export interface SubMenu {
  title: string;
  children?: SubMenu[];
  matIcon?: string;
  faIcon?: string;
  routerLink: string;
  routerLink_param?: string;
}
