import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";

import {AlertService} from '@app/_services';
import {Activity, Event, Thanks} from '@app/_models';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent {
  public totalSeasonPass: number;

  public is_loaded: Boolean = false;
  public home_info: ConfigHome;
  public next_event: Event;
  configUrl = "assets/demo.json";

  constructor(private http: HttpClient, private alertService: AlertService) {
    // Load data
    this.http.get(`${environment.apiUrl}/cmd/stat/total_season_pass`).subscribe((data: StatPassData) => {
      this.totalSeasonPass = data.total_season_pass_2017;
    }, error => console.error(error));

    this.http.get(this.configUrl).subscribe(
      (data: JsonData) => {
        this.home_info = data.home;
        let i: any = this.home_info.index_next_event;
        this.next_event = this.home_info.events[i];
        this.is_loaded = true;
      }, error => this.alertService.error(error));
  }

  // ngOnInit() {
  //   // Fill data from local json
  // }
}

interface JsonData {
  home: ConfigHome;
}

interface ConfigHome {
  title: String;
  summary: String,
  index_next_event: Number;
  show_next_event: Boolean;
  events: Event[];
  activity: Activity;
  thanks: Thanks;
}

interface StatPassData {
  total_season_pass_2017: number;
}
