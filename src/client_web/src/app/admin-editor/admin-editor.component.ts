import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {AlertService, AuthenticationService, DebugService, LarpemService} from '@app/_services';
import {User} from '@app/_models';
import {StatusHttpUpdateFileURL, StatusHttpGetInfo} from "@app/admin-editor/editor";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

import {environment} from "@environments/environment";

@Component({selector: 'admin-editor', templateUrl: 'admin-editor.component.html'})
export class AdminEditorComponent implements OnInit, OnDestroy {
  // Model
  public currentUser: User;

  // Loading
  public isLoaded: Boolean = false;
  private watchers: Subscription[] = [];
  private updateBoxLink: string;
  private showUpdateBox: boolean;
  private currentLink: string;
  private lastUpdateTime: string;
  private error: any;
  private isInternalError: boolean;
  private debug: boolean;

  constructor(private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private http: HttpClient,
              private snackBar: MatSnackBar,
              private debugService: DebugService,
  ) {
    this.debug = false;
  }

  updateLink(): void {
    let data = {"fileURL": this.updateBoxLink};

    this.http.post(`${environment.apiUrl}/cmd/editor/update_file_url`, data).pipe(
      catchError(this.onHttpError)
    ).subscribe((result: StatusHttpUpdateFileURL) => {
      this.snackBar.open('Mis à jour du lien.', 'Fermer', {
        duration: 100000,
      });
      this.currentLink = result.fileURL;
      this.lastUpdateTime = new Date().toLocaleString()
      // }, (error: HttpErrorResponse) => {
      //   this.onHttpError(error);
    });

    this.updateBoxLink = "";
    this.showUpdateBox = false;
  }

  ngOnInit() {
    let watcher: Subscription;
    // User
    watcher = this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.watchers.push(watcher);

    // Debug
    watcher = this.debugService.debugView.subscribe(x => {
      this.debug = x.enabled;
    });
    this.watchers.push(watcher);

    this.http.get(`${environment.apiUrl}/cmd/editor/get_info`).pipe(
      catchError(this.onHttpError)
    ).subscribe((result: StatusHttpGetInfo) => {
      this.currentLink = result.fileURL;
      this.lastUpdateTime = new Date(result.lastLocalDocUpdate).toLocaleString();
      // }, (error: HttpErrorResponse) => {
      //   this.onHttpError(error);
    });
  }

  private onHttpError(error: HttpErrorResponse) {
    console.error(error);
    if (error.error instanceof ErrorEvent) {

      this.error = {msg: "Erreur interne du serveur.", debug: error.error.message};
      this.isInternalError = true;
      this.snackBar.open(error.status + " " + error.statusText, 'Fermer', {
        duration: 100000,
      });
    } else {
      console.error(
      `Backend returned code ${error.status}, ` +
      `body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
