import {Component, OnInit} from '@angular/core';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';

import {AlertService, LarpemService} from '@app/_services';
import {Manual, Document} from "@app/_models";

@Component({
  selector: 'manual',
  templateUrl: 'manual.component.html'
})
export class ManualComponent implements OnInit {
  public currentDocument: Document;
  public documentName: string;
  public manual$: Observable<Manual>;

  constructor(private route: ActivatedRoute, private router: Router, private alertService: AlertService, private larpemService: LarpemService) {
  }

  ngOnInit() {
    // Subscribe to documentName, then detect when change document
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        of(params.get('documentName'))
      )
    ).subscribe((d) => {
      this.documentName = d;
      this.currentDocument = this.larpemService.getManualDocument(this.documentName);
    });

    // Keep reference on subscriber manual
    this.manual$ = this.larpemService.currentManual;
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
