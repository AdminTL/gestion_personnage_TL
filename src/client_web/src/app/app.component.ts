import {Component} from '@angular/core';
import {ObservableMedia, MediaChange} from '@angular/flex-layout';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isExpanded = false;

  opened = true;
  over = 'side';
  expandHeight = '42px';
  collapseHeight = '42px';
  displayMode = 'flat';
  // overlap = false;

  watcher: Subscription;

  constructor(
    private media: ObservableMedia,
  ) {

    this.watcher = media.subscribe((change: MediaChange) => {
      if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
        this.opened = false;
        this.over = 'over';
      } else {
        this.opened = true;
        this.over = 'side';
      }
    });
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle_nav_menu() {
    this.opened != this.opened;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
