export interface Menu {
  title: string;
  sibling: SubMenu[];
  grouped_sibling: SubMenu[];
}

export interface SubMenu {
  title: string;
  children?: SubMenu[];
  mat_icon?: string;
  fa_icon?: string;
  router_link: string;
  router_link_param?: string;
}
