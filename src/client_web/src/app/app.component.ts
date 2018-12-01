import {Component, OnInit} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {Menu, User} from '@app/_models';
import * as ScreenFull from 'screenfull';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Model
  public currentUser: User;
  public currentMenu: Menu;

  public is_loaded: Boolean = false;

  // Menu variable
  public opened = true;
  public over = 'side';
  public expandHeight = '42px';
  public collapseHeight = '42px';
  public displayMode = 'flat';
  public overlap = false;

  // View
  public is_fullscreen = false;

  public organization_info = {
    "name": "Traître-Lame",
    "summary": "Grandeur-Nature 18+ ans Médiévale Fantastique"
  };

  public watcher: Subscription;

  constructor(
    private media: ObservableMedia,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private larpemService: LarpemService,
  ) {
  }

  ngOnInit() {
    // User
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);

    // Menu
    this.larpemService.currentMenu.subscribe(x => {
      this.currentMenu = x;
      console.info(this.currentMenu);
      if (this.currentMenu) {
        this.is_loaded = true;
      } else {
        this.alertService.error("Failed to load Model Menu. It's empty");
      }
    });

    // Update nav-menu depends on larger of window
    this.watcher = this.media.subscribe((change: MediaChange) => {
      if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
        this.opened = false;
        this.over = 'over';
      } else {
        this.opened = true;
        this.over = 'side';
      }
    });

    ScreenFull.on("change", () => {
      this.is_fullscreen = ScreenFull.isFullscreen;
    });

    ScreenFull.on("error", event => {
      this.alertService.error("Failed to toggle fullscreen : " + event);
    });
  }

  toggle_nav_menu() {
    this.opened != this.opened;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  onScreenToggle(): void {
    ScreenFull.toggle();
  }

}
