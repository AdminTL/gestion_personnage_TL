import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
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

  constructor(private http: HttpClient, private authenticationService: AuthenticationService, private alertService: AlertService, private larpemService: LarpemService) {
  }

  ngOnInit() {
    // Home
    this.larpemService.currentHome.subscribe(x => {
      this.model_home = x;
      if (this.model_home) {
        let index_next_event: any = this.model_home.index_next_event;
        this.next_event = this.model_home.events[index_next_event];
        this.is_loaded = true;
      } else {
        this.alertService.error("Failed to load Model Home. It's empty");
      }
    });

  }
}
