import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

import {MatSnackBar} from '@angular/material';

import {AlertService} from '@app/_services';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  message: any;

  constructor(private alertService: AlertService, private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.subscription = this.alertService.getMessage().subscribe(message => {
      // this.text = text;
      if (message && message.text.length) {
        let formatted_message: string;
        if (message.type == "success") {
          formatted_message = "Succès : " + message.text;
        } else if (message.type == "error") {
          formatted_message = "Erreur : " + message.text;
        } else {
          formatted_message = message.text;
        }
        this.snackBar.open(formatted_message, "", {duration: 10000,});
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
