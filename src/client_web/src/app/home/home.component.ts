import {Component, OnInit, AfterContentInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {Event, Home} from '@app/_models';

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit {
  public isLoaded: Boolean = false;
  public modelHome: Home;
  public nextEvent: Event;
  private msgInits: String[] = [];

  constructor(private http: HttpClient, private authenticationService: AuthenticationService, private alertService: AlertService, private larpemService: LarpemService) {
  }

  ngOnInit() {
    // Home
    this.larpemService.currentHome.subscribe((x: Home) => {
      this.modelHome = x;
      if (this.modelHome && this.modelHome.events && this.modelHome.indexNextEvent) {
        let indexNextEvent: any = this.modelHome.indexNextEvent;
        this.nextEvent = this.modelHome.events[indexNextEvent];
        this.isLoaded = true;
      } else {
        this.msgInits.push('Cannot receive home model data.');
      }
    });

  }

  ngAfterContentInit() {
    let msgAppend: string = "";
    for (let msg of this.msgInits) {
      msgAppend += msg;
    }
    if (msgAppend) {
      this.alertService.error(msgAppend, true);
    }
  }
}
