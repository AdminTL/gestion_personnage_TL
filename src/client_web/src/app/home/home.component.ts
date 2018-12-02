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
  public isLoaded: Boolean = false;
  public modelHome: Home;
  public nextEvent: Event;

  constructor(private http: HttpClient, private authenticationService: AuthenticationService, private alertService: AlertService, private larpemService: LarpemService) {
  }

  ngOnInit() {
    // Home
    this.larpemService.currentHome.subscribe(x => {
      this.modelHome = x;
      if (this.modelHome) {
        let indexNextEvent: any = this.modelHome.indexNextEvent;
        this.nextEvent = this.modelHome.events[indexNextEvent];
        this.isLoaded = true;
      }
    });

  }
}
