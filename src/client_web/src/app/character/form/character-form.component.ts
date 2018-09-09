import { Component, Inject, AfterViewChecked } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

@Component({
    selector: 'character-form',
    templateUrl: './character-form.component.html'
})
export class CharacterFormComponent {
    public character: Character;

    public formSections: any[];

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private _router: Router) {
        http.get(baseUrl + 'cmd/character_form').subscribe(result => {
            this.formSections = result.json() as Section[];
        }, error => console.error(error));
    }
}
