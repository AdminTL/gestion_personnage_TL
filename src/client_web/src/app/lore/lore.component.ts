import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lore',
  templateUrl: './lore.component.html',
  styleUrls: ['./lore.component.css']
})
export class LoreComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  isMobile(): boolean {
    return false;
  }
}
