import {Component} from '@angular/core';
import {Http} from '@angular/http';

import {environment} from "@environments/environment";

@Component({
  selector: 'home',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  public totalSeasonPass: number;

  constructor(http: Http) {
    http.get(`${environment.apiUrl}/cmd/stat/total_season_pass`).subscribe(result => {
      this.totalSeasonPass = (result.json() as SeasonPassNumber).result;
    }, error => console.error(error));
  }
}

interface SeasonPassNumber {
  result: number;
}
