import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {AuthService, SocialUser} from "angularx-social-login";
import {FacebookLoginProvider, GoogleLoginProvider, LinkedInLoginProvider} from "angularx-social-login";

import {environment} from '@environments/environment';
import {User} from '@app/_models';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
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
    this.authService.signOut();
  }

  signInWithFB() {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data: SocialUser) => {
      console.log("SUCCÈS");
      console.log(data);
      this.sendToRestApiMethod(data.authToken)
    }).catch(data => {
      console.error("NOOOO");
      console.error(data);
    });
  }

  sendToRestApiMethod(token: string): void {
    this.http.get(`${environment.apiUrl}/cmd/auth/facebook/`)
      .subscribe(onSuccess => {
          //login was successful
          //save the token that you got from your REST API in your preferred location i.e. as a Cookie or LocalStorage as you do with normal login
          // console.log(data);
          // let user = new User();
          // user.id = data.id;
          // user.username = data.name;
          // user.token = data.authToken;
          //
          // localStorage.setItem('currentUser', JSON.stringify(user));
          // this.currentUserSubject.next(user);
          console.log(onSuccess);
        }, onFail => {
          //login was unsuccessful
          //show an error message
          console.log(onFail);
        }
      );
  }
}
