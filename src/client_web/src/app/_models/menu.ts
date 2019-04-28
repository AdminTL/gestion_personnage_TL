export interface Menu {
  title: string;
  requiredAdminPermission: boolean;
  subMenu: Menu[];
  matIcon: string;
  faIcon: string;
  routerLink: string;
  routerLink_param?: string;
}
