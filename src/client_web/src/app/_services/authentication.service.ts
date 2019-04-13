import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User, UserPermission, AuthConfig} from '@app/_models';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentAuthConfigSubject: BehaviorSubject<AuthConfig>;
  public currentAuthConfig: Observable<AuthConfig>;

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentAuthConfigSubject = new BehaviorSubject<AuthConfig>(JSON.parse(localStorage.getItem('currentAuthConfig')));
    this.currentAuthConfig = this.currentAuthConfigSubject.asObservable();

    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public fetchAuthConfigServer(): void {
    this.http.get<any>(`${environment.apiUrl}/user/auth_config`)
      .subscribe(data => {

          let authConfig = new AuthConfig();
          authConfig.enableSocialAuth = data.enableSocialAuth;
          authConfig.enableGoogleAuth = data.enableGoogleAuth;
          authConfig.enableFacebookAuth = data.enableFacebookAuth;

          localStorage.setItem('currentAuthConfig', JSON.stringify(authConfig));
          this.currentAuthConfigSubject.next(authConfig);

        }, onFail => {
          //login was unsuccessful
          //show an error message
          console.error(onFail);
        }
      );
  }

  public fetchUserServer(): void {
    this.http.get<any>(`${environment.apiUrl}/user/current`)
      .subscribe(data => {
          //login was successful
          //save the token that you got from your REST API in your preferred location i.e. as a Cookie or LocalStorage as you do with normal login
          if (data.message) {
            console.warn("Cannot find user");
          } else {

            let user = new User();
            user.id = data.body.user_id;
            user.username = data.body.username;
            user.token = "null";
            user.permission = new UserPermission();
            user.permission.isAdmin = data.body.is_admin;

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }

        }, onFail => {
          //login was unsuccessful
          //show an error message
          console.error(onFail);
        }
      );
  }

  public get currentAuthConfigValue(): AuthConfig {
    return this.currentAuthConfigSubject.value;
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get isUserConnected(): User {
    return <any>this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/user/authenticate`, {username, password})
      .pipe(map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.http.get(`${environment.apiUrl}/user/logout`).subscribe(data => {
      console.log("Logout with success.");
    });
  }

  signInWithFB() {
    window.location.href = `${environment.apiUrl}/cmd/auth/facebook/`;
  }

  signInWithGoogle() {
    window.location.href = `${environment.apiUrl}/cmd/auth/google/`;
  }

  signInWithTwitter() {
    window.location.href = `${environment.apiUrl}/cmd/auth/twitter/`;
  }

}
