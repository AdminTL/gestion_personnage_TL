import {Component, OnInit} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService} from '@app/_services';
import {Menu, User} from '@app/_models';
import * as ScreenFull from 'screenfull';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public currentUser: User;

  // Menu variable
  public opened = true;
  public over = 'side';
  public expandHeight = '42px';
  public collapseHeight = '42px';
  public displayMode = 'flat';
  public overlap = false;

  // View
  public is_fullscreen = false;

  // Menu
  public menu: Menu = {
    "title": "",
    "sibling": [
      {
        "title": "Accueil",
        "children": [],
        "mat_icon": "home",
        "router_link": "/home",
        "fa_icon": ""
      }
    ],
    "grouped_sibling": [
      {
        "title": "Guide / Manuel",
        "mat_icon": "description",
        "router_link": "",
        "fa_icon": "",
        "children": [
          {
            "title": "Manuel du joueur",
            "children": [],
            "mat_icon": "description",
            "router_link": "/manual",
            "fa_icon": ""
          },
          {
            "title": "Univers",
            "children": [],
            "mat_icon": "description",
            "router_link": "/lore",
            "fa_icon": ""
          }
        ]
      },
      {
        "title": "Personnage",
        "mat_icon": "",
        "fa_icon": "theater-masks",
        "router_link": "",
        "children": [
          {
            "title": "Personnage",
            "children": [],
            "mat_icon": "",
            "router_link": "/character",
            "fa_icon": "theater-masks"
          }
        ]
      },
      {
        "title": "Admin",
        "mat_icon": "",
        "fa_icon": "mask",
        "router_link": "",
        "children": [
          {
            "title": "Personnage",
            "children": [],
            "mat_icon": "",
            "router_link": "/character",
            "fa_icon": "theater-masks"
          },
          {
            "title": "Manuel Admin",
            "children": [],
            "mat_icon": "description",
            "router_link": "/manual",
            "fa_icon": ""
          },
          {
            "title": "Éditeur",
            "children": [],
            "mat_icon": "edit",
            "router_link": "",
            "fa_icon": ""
          },
          {
            "title": "Paramètre",
            "children": [],
            "mat_icon": "settings",
            "router_link": "",
            "fa_icon": ""
          }
        ]
      }
    ]
  };

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

    ScreenFull.on("change", () => {
      this.is_fullscreen = ScreenFull.isFullscreen;
    });

    ScreenFull.on("error", event => {
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
    ScreenFull.toggle();
  }

}
