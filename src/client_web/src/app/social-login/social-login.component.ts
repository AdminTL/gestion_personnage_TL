import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {AlertService, AuthenticationService} from '@app/_services';

@Component({selector: 'social-login', templateUrl: 'social-login.component.html'})
export class SocialLoginComponent {
  loading = false;
  authProvider: any[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
  ) {

    this.authProvider = [
      {name: "Facebook", cb: this.authenticationService.signInWithFB},
      {name: "Google", cb: this.authenticationService.signInWithGoogle},
      // {name:"Twitter", cb:this.authenticationService.signInWithTwitter},
    ];
  }
}
