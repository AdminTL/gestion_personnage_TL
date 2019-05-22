export interface Menu {
  title: string;
  requireAdmin: boolean;
  requireLogin: boolean;
  requireLogout: boolean;
  subMenu: Menu[];
  matIcon: string;
  faIcon: string;
  routerLink: string;
  routerLink_param?: string;
}
