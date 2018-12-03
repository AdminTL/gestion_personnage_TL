import {Injectable} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {Alert} from '@app/_models';

@Injectable({providedIn: 'root'})
export class AlertService {
  private subject = new Subject<Alert>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router) {
    // clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.subject.next();
        }
      }
    });
  }

  success(message: string, keepAfterNavigationChange = false) {
    let alert = {} as Alert;
    alert.type = 'success';
    alert.text = message;

    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next(alert);
  }

  error(message: string, keepAfterNavigationChange = false) {
    let alert = {} as Alert;
    alert.type = 'error';
    alert.text = message;

    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next(alert);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
