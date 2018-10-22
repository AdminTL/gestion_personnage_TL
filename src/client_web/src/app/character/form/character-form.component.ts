import { Character } from '../character';
import { Component, Inject, AfterViewChecked } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';

@Component({
    selector: 'character-form',
    templateUrl: './character-form.component.html'
})
export class CharacterFormComponent {
    public character: Character;

    public formSectionsRoot: any;

    constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string, private _router: Router, public snackBar: MatSnackBar) {
        this.http.get(this.baseUrl + 'cmd/character_form').subscribe(result => {
            this.character = new Character();
            this.formSectionsRoot = result.json() as Section[];
        }, error => console.error(error));
    }

    submit(): void {
        this.http.post(this.baseUrl + 'cmd/character', JSON.stringify(this.character)).subscribe(result => {
            this.snackBar.open('Enregistré avec succès', 'Femer', {
              duration: 2000,
            });
        }, error => {
            console.error(error);
            this.snackBar.open('Erreur lors de l\'enregistrement', 'Femer', {
                duration: 2000,
            });
        });
    }
}
