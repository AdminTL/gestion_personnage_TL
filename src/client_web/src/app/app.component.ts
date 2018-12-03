import {Component, OnInit, OnDestroy} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {Menu, Organization, User} from '@app/_models';
import * as ScreenFull from 'screenfull';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // Model
  public currentUser: User;
  public modelMenu: Menu;
  public modelOrganization: Organization;

  // Loading
  public isLoaded: Boolean = false;
  private watchers: Subscription[] = [];

  // Menu variable
  public opened = true;
  public over = 'side';
  public expandHeight = '42px';
  public collapseHeight = '42px';
  public displayMode = 'flat';
  public overlap = false;

  // View
  public isFullscreen = false;

  constructor(
    private media: ObservableMedia,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private larpemService: LarpemService,
  ) {
  }

  ngOnInit() {
    let watcher: Subscription;
    // User
    watcher = this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.watchers.push(watcher);

    // Menu
    watcher = this.larpemService.currentMenu.subscribe(x => {
      this.modelMenu = x;
      if (this.modelMenu) {
        this.isLoaded = true;
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

    // Update nav-menu depends on larger of window
    watcher = this.media.subscribe((change: MediaChange) => {
      if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
        this.opened = false;
        this.over = 'over';
      } else {
        this.opened = true;
        this.over = 'side';
      }
    });
    this.watchers.push(watcher);

    ScreenFull.on("change", () => {
      this.isFullscreen = ScreenFull.isFullscreen;
    });

    ScreenFull.on("error", event => {
      this.alertService.error("Sans succès de plein écran : " + event);
    });
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  onScreenToggle(): void {
    ScreenFull.toggle();
  }

}
