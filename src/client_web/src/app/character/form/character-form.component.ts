import { CharacterContainer } from './models';
import { Character } from '../character';
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {environment} from "@environments/environment";

@Component({
    selector: 'character-form',
    templateUrl: './character-form.component.html'
})
export class CharacterFormComponent {
    public character: Character;
    public characterContainer: CharacterContainer;
    public formSectionsRoot: any;

    constructor(private http: Http, private _router: Router, public snackBar: MatSnackBar) {
        this.http.get(`${environment.apiUrl}/cmd/character_form`).subscribe(result => {
            this.character = new Character();
            this.characterContainer = new CharacterContainer(this.character, this.submit);
            this.formSectionsRoot = result.json() as Section[];
        }, error => console.error(error));
    }

    submit(): void {
        this.http.post(`${environment.apiUrl}/cmd/character`, JSON.stringify(this.character)).subscribe(result => {
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
