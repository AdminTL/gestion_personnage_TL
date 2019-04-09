import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';

import {AlertService, AuthenticationService} from '@app/_services';
import {AuthConfig} from '@app/_models';

@Component({selector: 'social-login', templateUrl: 'social-login.component.html'})
export class SocialLoginComponent implements OnInit, OnDestroy {
  // Model
  public currentAuthConfig: AuthConfig;

  // Loading
  public isLoaded: Boolean = false;
  authProvider: any[];
  private watchers: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
  ) {

    this.authProvider = [
      // {name:"Twitter", cb:this.authenticationService.signInWithTwitter},
    ];
  }

  ngOnInit() {
    let watcher: Subscription;
    // User
    watcher = this.authenticationService.currentAuthConfig.subscribe(x => {
      this.authProvider = [];
      this.currentAuthConfig = x;
      if (x.enableSocialAuth) {
        if (x.enableGoogleAuth) {
          this.authProvider.push({name: "Google", cb: this.authenticationService.signInWithGoogle})
        }
        if (x.enableFacebookAuth) {
          this.authProvider.push({name: "Facebook", cb: this.authenticationService.signInWithFB})
        }
      }
    });
    this.watchers.push(watcher);
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
