import {Component} from '@angular/core';
import {Subscription} from 'rxjs';

import {User} from "@app/_models";
import {UserService, AuthenticationService} from '@app/_services';

@Component({
  selector: 'nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  currentUser: User;
  currentUserSubscription: Subscription;

  isExpanded = false;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

}
