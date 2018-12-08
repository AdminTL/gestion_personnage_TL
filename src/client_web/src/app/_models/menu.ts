export interface Menu {
  title: string;
  sibling: SubMenu[];
  grouped_sibling: SubMenu[];
}

export interface SubMenu {
  title: string;
  requiredAdminPermission: boolean;
  children?: SubMenu[];
  matIcon?: string;
  faIcon?: string;
  routerLink: string;
  routerLink_param?: string;
}
