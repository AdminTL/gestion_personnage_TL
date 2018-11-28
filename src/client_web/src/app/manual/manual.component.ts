import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Router} from '@angular/router';
import {environment} from "@environments/environment";

@Component({
  selector: 'manual',
  templateUrl: './manual.component.html'
})
export class ManualComponent {
  public manualRoot: ManualRoot;
  private router: Router;

  constructor(http: Http, router: Router) {
    http.get(`${environment.apiUrl}/cmd/manual`).subscribe(result => {
      this.manualRoot = result.json() as ManualRoot;
    }, error => console.error(error));
    this.router = router;
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

interface ManualRoot {
  manual: Section[];
}
