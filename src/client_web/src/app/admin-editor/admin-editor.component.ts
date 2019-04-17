import {Component, OnInit, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {AlertService, AuthenticationService, DebugService} from '@app/_services';
import {User} from '@app/_models';
import {StatusHttpUpdateFileURL, StatusHttpGetInfo} from "@app/admin-editor/editor";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

import {environment} from "@environments/environment";

// Check this tutorial
// https://scotch.io/@vigneshsithirai/angular-6-7-http-client-interceptor-with-error-handling
// https://scotch.io/bar-talk/error-handling-with-angular-6-tips-and-best-practices192#toc-handling-errors-with-httpclient
// https://blog.angular-university.io/angular-http/
// https://angular.io/guide/http#getting-error-details
// https://codecraft.tv/courses/angular/http/http-with-observables/

@Component({selector: 'admin-editor', templateUrl: 'admin-editor.component.html'})
export class AdminEditorComponent implements OnInit, OnDestroy {
  // Model
  public currentUser: User;

  // Loading
  public isLoaded: Boolean = false;
  private watchers: Subscription[] = [];
  private updateBoxLink: string;
  private showUpdateBox: boolean;
  private lastUpdateTime: string;
  private error: any;
  private isInternalError: boolean;
  private debug: boolean;

  private editorInfo$: Observable<StatusHttpGetInfo>;
  private editorInfo: StatusHttpGetInfo;

  private isAuth: string;
  private hasAccessPerm: boolean;
  private emailGoogleService: string;
  private canGenerate: boolean;

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

    this.http.post(`${environment.apiUrl}/cmd/editor/update_file_url`, data)
      .pipe(
        catchError(this.handlerHttpError)
      )
      .subscribe((result: StatusHttpUpdateFileURL) => {
        this.isInternalError = false;
        // let data: StatusHttpUpdateFileURL = JSON.parse(result.text());
        this.snackBar.open('Mis à jour du lien.', 'Fermer', {
          duration: 100000,
        });
        this.editorInfo.fileURL = result.fileURL;
        this.lastUpdateTime = new Date().toLocaleString()
        // }, error => {
        //   console.log(`test mathben ${error}`);
        //   this.handlerHttpError(error);
      });

    this.updateBoxLink = "";
    this.showUpdateBox = false;
  }

  requestWritingPermissionCurrentUser(): void {
    let data = {};

    this.http.post(`${environment.apiUrl}/cmd/editor/add_generator_share`, data).subscribe(result => {
      this.isInternalError = false;
      this.editorInfo.userHasWriterPerm = true;
      // }, error => {
      //   this.handlerHttpError(error);
    });
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

    this.refreshInit();
  }

  private handlerHttpError(error: HttpErrorResponse) {
    // console.error(error);
    // this.error = {msg: "Erreur interne du serveur.", debug: error._body};
    // this.isInternalError = true;
    // this.snackBar.open(error.status + " " + error.statusText, 'Fermer', {
    //   duration: 100000,
    // });
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
      console.error(error);
      console.log(error);
      this.error = {msg: "Erreur interne du serveur.", debug: error};
      this.isInternalError = true;
      // this.snackBar.open(`${error}`, 'Fermer', {
      //   duration: 100000,
      // });
      this.snackBar.open(error.status + " " + error, 'Fermer', {
        duration: 100000,
      });
    }
    return throwError('Something bad happened; please try again later.');
  }

  refreshInit(): void {
    this.isLoaded = false;
    this.editorInfo$ = null;

    this.http.get(`${environment.apiUrl}/cmd/editor/get_info`).subscribe((result: StatusHttpGetInfo) => {
      this.isInternalError = false;

      // let res = result.json();
      // console.debug(res);

      let obsEditorInfo = new BehaviorSubject<StatusHttpGetInfo>(result);
      this.editorInfo$ = obsEditorInfo.asObservable();

      this.lastUpdateTime = new Date(result.lastLocalDocUpdate).toLocaleString();
      this.isLoaded = true;
      // }, error => {
      //   this.handlerHttpError(error);
    });
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
