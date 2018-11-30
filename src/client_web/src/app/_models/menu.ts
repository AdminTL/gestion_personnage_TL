export interface Menu {
  title: String;
  sibling: SubMenu[];
  grouped_sibling: SubMenu[];
}

export interface SubMenu {
  title: String;
  children: SubMenu[];
  mat_icon: String;
  router_link: String;
  fa_icon: String;
}
