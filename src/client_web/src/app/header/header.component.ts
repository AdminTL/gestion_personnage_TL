import { Component, OnInit } from '@angular/core';
import { TabMenuModule, MenuItem } from 'primeng/primeng';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }
  
  menuItems: MenuItem[];
  activeItem: MenuItem;

  ngOnInit() {
      this.menuItems = [
          { label: 'Univers', icon: 'fa-bar-chart' },
          { label: 'Règles', icon: 'fa-calendar' },
          { label: 'Personnage', icon: 'fa-book' }
      ];
      this.activeItem = undefined;
  }


  ConvertLabelToRoute(){
    switch (this.activeItem) {
      case "Univers":
        return "lore";
      case "Règles":
        return "manual";
      case "Personnage":
        return "character";
      default:
        return "not-found"; // not an actual route but will fall through to ** which is NotFoundComponent
    }
  }
}
