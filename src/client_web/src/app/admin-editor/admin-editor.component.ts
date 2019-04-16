import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {AlertService, AuthenticationService, DebugService, LarpemService} from '@app/_services';
import {User} from '@app/_models';
import {StatusHttpUpdateFileURL} from "@app/admin-editor/editor";
import {Http} from '@angular/http';
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
              private http: Http,
              private snackBar: MatSnackBar,
              private debugService: DebugService,
  ) {
    this.debug = false;
  }

  updateLink(): void {
    let data = {"fileURL": this.updateBoxLink};

    this.http.post(`${environment.apiUrl}/cmd/editor/update_file_url`, data).subscribe(result => {
      this.isInternalError = false;
      let data: StatusHttpUpdateFileURL = JSON.parse(result.text());
      this.snackBar.open('Mis à jour du lien.', 'Fermer', {
        duration: 100000,
      });
      this.currentLink = data.fileURL;
      this.lastUpdateTime = new Date().toLocaleString()
    }, error => {
      this.onHttpError(error);
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

    this.http.get(`${environment.apiUrl}/cmd/editor/get_info`).subscribe(result => {
      this.isInternalError = false;
      let res = result.json();
      this.currentLink = res.fileURL;
      this.lastUpdateTime = new Date(res.lastLocalDocUpdate).toLocaleString();
    }, error => {
      this.onHttpError(error);
    });
  }

  onHttpError(error: any) {
    console.error(error);
    this.error = {msg: "Erreur interne du serveur.", debug: error._body};
    this.isInternalError = true;
    this.snackBar.open(error.status + " " + error.statusText, 'Fermer', {
      duration: 100000,
    });

  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
