import { Component, Inject, AfterViewChecked } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

@Component({
    selector: 'lore',
    templateUrl: './lore.component.html'
})
export class LoreComponent implements AfterViewChecked {
    public loreRoot: LoreRoot;
    private router: Router;

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string, router: Router) {
        http.get(baseUrl + 'cmd/lore').subscribe(result => {
            this.loreRoot = result.json() as LoreRoot;
        }, error => console.error(error));

        this.router = router;
    }

    // Be careful: changes in the page DOM will make the page go to the anchor.
    // it was the only way to make a dynamically generated page have anchors.
    ngAfterViewChecked() {
        const tree = this.router.parseUrl(this.router.url);
    console.log("view checked. Url: " + this.router.url);
        if (tree.fragment) {
            const element = document.querySelector("#" + tree.fragment);
            if (element) {
            console.log("going to " + tree.fragment);
            element.scrollIntoView(true); }
        }
    }
}

interface LoreRoot {
    lore: Section[];
}
