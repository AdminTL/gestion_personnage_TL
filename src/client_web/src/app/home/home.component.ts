import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {AlertService} from '@app/_services';
import {Event, Home} from '@app/_models';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {
  public is_loaded: Boolean = false;
  public model_home: Home;
  public next_event: Event;
  configUrl = "assets/demo.json";

  constructor(private http: HttpClient, private alertService: AlertService) {
  }

  ngOnInit() {
    // Load data
    this.http.get(this.configUrl).subscribe(
      (data: JsonData) => {
        this.model_home = data.home;
        let index_next_event: any = this.model_home.index_next_event;
        this.next_event = this.model_home.events[index_next_event];
        this.is_loaded = true;
      }, error => this.alertService.error(error));

  }
}

interface JsonData {
  home: Home;
}
