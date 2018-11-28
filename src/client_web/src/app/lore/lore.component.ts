﻿import { Component, AfterViewChecked } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import {environment} from "@environments/environment";

@Component({
    selector: 'lore',
    templateUrl: './lore.component.html'
})
export class LoreComponent implements AfterViewChecked {
    public loreRoot: LoreRoot;

    constructor(http: Http, private _router: Router) {
        http.get(`${environment.apiUrl}/cmd/lore`).subscribe(result => {
            this.loreRoot = result.json() as LoreRoot;
        }, error => console.error(error));
    }

    // Be careful: changes in the page DOM will make the page go to the anchor.
    // it was the only way to make a dynamically generated page have anchors.
    ngAfterViewChecked() {
        const tree = this._router.parseUrl(this._router.url);
    console.log("view checked. Url: " + this._router.url);
        if (tree.fragment) {
            const element = document.querySelector("#" + tree.fragment);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // works wonky on different screens
            }
        }
    }
}

interface LoreRoot {
    lore: Section[];
}
