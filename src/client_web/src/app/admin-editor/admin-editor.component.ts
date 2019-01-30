import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {AlertService, AuthenticationService, LarpemService} from '@app/_services';
import {User} from '@app/_models';
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

  constructor(private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private http: Http,
              private snackBar: MatSnackBar) {
  }

  updateLink(): void {

    this.http.post(`${environment.apiUrl}/cmd/editor/update_file_url`, this.updateBoxLink).subscribe(result => {
      this.snackBar.open('Mis à jour avec succès', 'Fermer', {
        duration: 5000,
      });
      this.currentLink = this.updateBoxLink;
      this.lastUpdateTime = new Date().toLocaleString()
    }, error => {
      console.error(error);
      this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
        duration: 5000,
      });
    });

    this.updateBoxLink = "";
    this.showUpdateBox = false;
  }

  ngOnInit() {
    let watcher: Subscription;
    // User
    watcher = this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.watchers.push(watcher);

    this.http.get(`${environment.apiUrl}/cmd/editor/get_info`).subscribe(result => {
      let res = result.json();
      this.currentLink = res.file_url;
      this.lastUpdateTime = new Date(res.last_local_doc_update).toLocaleString();
    }, error => {
      console.error(error);
      this.snackBar.open('Erreur de chargement des données', 'Fermer', {
        duration: 10000,
      });
    });
  }

  ngOnDestroy() {
    for (let watcher of this.watchers) {
      watcher.unsubscribe();
    }
  }
}
