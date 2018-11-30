import {Component, OnInit} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService} from '@app/_services';
import {User} from '@app/_models';
import * as screenfull from 'screenfull';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private currentUser: User;

  // Menu variable
  private opened = true;
  private over = 'side';
  private expandHeight = '42px';
  private collapseHeight = '42px';
  private displayMode = 'flat';
  private overlap = false;

  // Vue
  private is_fullscreen = false;

  private organization_info = {
    "name": "Traître-Lame",
    "summary": "Grandeur-Nature 18+ ans Médiévale Fantastique"
  };

  watcher: Subscription;

  constructor(
    private media: ObservableMedia,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
  ) {
  }

  ngOnInit() {
    // User
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);

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

    screenfull.on("change", () => {
      this.is_fullscreen = screenfull.isFullscreen;
    });

    screenfull.on("error", event => {
      this.alertService.error("Failed to toggle fullscreen", event);
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
    screenfull.toggle();
  }

}
