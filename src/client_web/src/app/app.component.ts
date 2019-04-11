import {Component, OnInit, OnDestroy} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService, DebugService, LarpemService} from '@app/_services';
import {Menu, Organization, User, AuthConfig, DebugView} from '@app/_models';
import * as ScreenFull from 'screenfull';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // Model
  public currentAuthConfig: AuthConfig;
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
  public isDebugView: DebugView;

  constructor(
    private media: ObservableMedia,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private larpemService: LarpemService,
    private debugService: DebugService,
  ) {
  }

  ngOnInit() {
    let watcher: Subscription;

    // Auth Config
    this.authenticationService.fetchAuthConfigServer();
    watcher = this.authenticationService.currentAuthConfig.subscribe(x => this.currentAuthConfig = x);
    this.watchers.push(watcher);

    // User
    this.authenticationService.fetchUserServer();
    watcher = this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.watchers.push(watcher);

    // Debug
    this.debugService.fetchDebugServer();
    watcher = this.debugService.debugView.subscribe(x => {
      this.isDebugView = x;
      console.debug(x);
      console.debug(x.enabled);
    });
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

  onDebugViewToggle(): void {
    this.debugService.toggleDebug();
  }

}
