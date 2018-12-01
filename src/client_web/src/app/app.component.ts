import {Component, OnInit} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

import {AlertService, AuthenticationService} from '@app/_services';
import {Menu, User} from '@app/_models';
import * as ScreenFull from 'screenfull';

// declare var invertRgb: any;

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

  invert_color_document(): void {
    // let el = {};
    // let el = window.getComputedStyle(document.body);
    let el = document.getElementById("sidenav");
    // style.invert = 100;
    // let el = document.body;
    // const {invertRgb} = require('invert-rgb');
    this.invertRgb(el, 'border-color');
    // document.body.style.filter.invert = 100;
  }

  // getStyle(element, cssRule): any {
  //   let value = ''
  //   if (document.defaultView && document.defaultView.getComputedStyle) {
  //     value = document.defaultView.getComputedStyle(element, '').getPropertyValue(cssRule)
  //   } else if (element.currentStyle) {
  //     cssRule = cssRule.replace(/\-(\w)/g, (res, val) => val.toUpperCase());
  //     value = element.currentStyle[cssRule]
  //   }
  //   return value
  // }

  getStyle(el: Element, styleProp: string): any {
    let value;
    const defaultView = el.ownerDocument.defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
      // sanitize property name to css notation (hypen separated words eg. font-Size)
      styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
      return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el['currentStyle']) { // IE
      // sanitize property name to camelCase
      styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
        return letter.toUpperCase();
      });
      value = el['currentStyle'][styleProp];
      return value;
    }

    return '';
  }

  invertRgb(element, cssRule): void {
    let color = this.getStyle(element, cssRule);
    let temp = color.split('(');
    let colors = temp[1].substring(0, temp[1].length - 1).split(',');
    for (let i = 0; i < 3; i++) {
      colors[i] = 255 - parseInt(colors[i]);
    }
    colors = colors.join(',');
    element.style[cssRule] = temp[0] + '(' + colors + ')';
    console.log(element.style[cssRule]);
  }

}
