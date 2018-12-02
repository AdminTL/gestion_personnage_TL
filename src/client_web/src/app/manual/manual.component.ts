import {Component, OnInit} from '@angular/core';
// import {Http} from '@angular/http';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';

// import {environment} from "@environments/environment";
import {AlertService, LarpemService} from '@app/_services';
import {Manual, Document} from "@app/_models";

@Component({
  selector: 'manual',
  templateUrl: 'manual.component.html'
})
export class ManualComponent implements OnInit {
  public manualRoot: Document;
  // public manualModel: Manual;
  public documentName: string;

  // public documents$: Observable<Document[]>;
  public manual$: Observable<Manual>;

  constructor(private route: ActivatedRoute, private router: Router, private alertService: AlertService, private larpemService: LarpemService) {

  }

  ngOnInit() {

    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        of(params.get('documentName'))
      )
    ).subscribe((d) => {
      this.documentName = d;
      this.manualRoot = this.larpemService.getManualDocument(this.documentName);
    });

    // this.manual$ = this.route.paramMap.pipe(
    //   switchMap(params => {
    //     console.debug("yup");
    //     // (+) before `params.get()` turns the string into a number
    //     this.documentName = params.get("documentName");
    //     // this.documentId = this.larpemService.getDocumentId(documentName);
    //     this.manualRoot = this.larpemService.getManualDocument(this.documentName);
    //     console.debug(this.manualRoot);
    //     return this.larpemService.currentManual;
    //   })
    // );

    // this.documents$ = this.route.paramMap.pipe(
    //   switchMap(params => {
    //     // (+) before `params.get()` turns the string into a number
    //     let documentName = params.get("documentName");
    //     this.documentId = this.larpemService.getDocumentId(documentName);
    //     return this.larpemService.getDocuments();
    //   })
    // );

    // this.documentName = this.route.paramMap.pipe(
    //   switchMap((params: ParamMap) =>
    //     this.documentName = params.get('documentName'))
    // );
    // this.documentName = this.route.snapshot.paramMap.get('documentName');
    // console.info(this.documentName);

    // this.manualRoot$ = this.route.paramMap.pipe(
    //   switchMap((params: ParamMap) =>
    //     this.larpemService.currentManualDocument(params.get('documentName')))
    // );

    // manual
    this.manual$ = this.larpemService.currentManual;
    // this.larpemService.currentManual.subscribe(x => {
    //   this.manualModel = x;
    //   if (this.manualModel) {
    //     this.manualRoot = this.manualModel.documents[0];
    //   }
    // });

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
