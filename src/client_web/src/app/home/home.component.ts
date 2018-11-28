import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

import {User} from '@app/_models';
import {UserService, AuthenticationService} from '@app/_services';
import {environment} from "@environments/environment";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public totalSeasonPass: number;
  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private http: HttpClient
  ) {
    this.http.get(`${environment.apiUrl}/cmd/stat/total_season_pass`).subscribe((data: StatPassData) => {
      this.totalSeasonPass = data.total_season_pass_2017;
    }, error => console.error(error));

    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  deleteUser(id: number) {
    this.userService.delete(id).pipe(first()).subscribe(() => {
      this.loadAllUsers()
    });
  }

  private loadAllUsers() {
    this.userService.getAll().pipe(first()).subscribe(users => {
      this.users = users;
    });
  }
}

interface SeasonPassNumber {
  result: number;
}

interface StatPassData {
  total_season_pass_2017: number;
}
