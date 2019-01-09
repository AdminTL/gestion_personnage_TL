import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subscription} from 'rxjs';

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {Event, Home, Organization} from '@app/_models';

@Component({
  templateUrl: 'admin-home.component.html',
  styleUrls: ['admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  public isLoaded: Boolean = false;
  public modelHome: Home;
  public nextEvent: Event;
  public modelOrganization: Organization;

  private watchers: Subscription[] = [];

  constructor(private http: HttpClient, private authenticationService: AuthenticationService, private alertService: AlertService, private larpemService: LarpemService) {
  }

  ngOnInit() {
    let watcher: Subscription;

    // Home
    watcher = this.larpemService.currentHome.subscribe((x: Home) => {
      this.modelHome = x;
      if (this.modelHome && this.modelHome.events && this.modelHome.indexNextEvent) {
        let indexNextEvent: any = this.modelHome.indexNextEvent;
        this.nextEvent = this.modelHome.events[indexNextEvent];
        this.isLoaded = true;
      } else {
        this.alertService.error('Cannot receive home model data.', true);
      }
    });
    this.watchers.push(watcher);

    // Organization
    watcher = this.larpemService.currentOrganization.subscribe(x => {
      this.modelOrganization = x;
      if (this.modelOrganization) {
        this.isLoaded = true;
      }
    });
    this.watchers.push(watcher);
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
