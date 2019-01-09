import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {User} from '@app/_models';

@Component({selector: 'admin-setting', templateUrl: 'admin-setting.component.html'})
export class AdminSettingComponent implements OnInit, OnDestroy {
  // Model
  public currentUser: User;

  // Loading
  public isLoaded: Boolean = false;
  private watchers: Subscription[] = [];

  constructor(private authenticationService: AuthenticationService,
              private alertService: AlertService,) {
  }

  ngOnInit() {
    let watcher: Subscription;
    // User
    watcher = this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.watchers.push(watcher);
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }

  downloadArchive() {
    window.open("/cmd/archive/generate_project", "_blank", "");
  }
}
