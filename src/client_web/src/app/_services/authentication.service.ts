import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '@environments/environment';
import {User} from '@app/_models';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public fetchUserServer(): void {
    this.http.get<any>(`${environment.apiUrl}/user/current`)
      .subscribe(data => {
          //login was successful
          //save the token that you got from your REST API in your preferred location i.e. as a Cookie or LocalStorage as you do with normal login
          console.log(data);
          if (data.message) {
            console.error("Cannot find user");
          } else {

            let user = new User();
            user.id = data.body.user_id;
            user.username = data.body.username;
            user.token = data.body.facebook_id;

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          // console.log(onSuccess);

        }, onFail => {
          //login was unsuccessful
          //show an error message
          console.error(onFail);
        }
      );
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
  }

  signInWithFB() {
    window.location.href = `${environment.apiUrl}/cmd/auth/facebook/`;
  }

}
