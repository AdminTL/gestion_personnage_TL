import {Component, OnInit} from '@angular/core';
// import {Http} from '@angular/http';
import {Router} from '@angular/router';

// import {environment} from "@environments/environment";
import {AlertService, LarpemService} from '@app/_services';
import {Manual, Document} from "@app/_models";

@Component({
  selector: 'manual',
  templateUrl: 'manual.component.html'
})
export class ManualComponent implements OnInit {
  public manualRoot: Document;
  public manualModel: Manual;
  // private router: Router;

  constructor(private router: Router, private alertService: AlertService, private larpemService: LarpemService) {

  }

  ngOnInit() {
    // manual
    this.larpemService.currentManual.subscribe(x => {
      this.manualModel = x;
      if (this.manualModel) {
        this.manualRoot = this.manualModel.documents[0];
      } else {
        this.alertService.error("Failed to load Model Manual. It's empty");
      }
    });
  }

  // Be careful: changes in the page will make the page go to the anchor.
  // it was the only way to make a dynamically generated page have anchors.
  ngAfterViewChecked() {
    const tree = this.router.parseUrl(this.router.url);
    if (tree.fragment) {
      const element = document.querySelector("#" + tree.fragment);
      if (element) {
        element.scrollIntoView({behavior: 'smooth', block: 'start'}); // works wonky on different screens
      }
    }
  }
}
