import {CharacterContainer} from './models';
import {Character} from '../character';
import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {MatSnackBar} from '@angular/material';
import {environment} from "@environments/environment";
import {Section} from "@app/_models/manual";
import { CharacterService } from '@app/_services/character.service';

@Component({
  selector: 'character-form',
  templateUrl: './character-form.component.html'
})
export class CharacterFormComponent {
  public character: Character;
  public characterContainer: CharacterContainer;
  public formSectionsRoot: any;

  constructor(private http:Http, private characterService: CharacterService, public snackBar: MatSnackBar) {
    this.http.get(`${environment.apiUrl}/cmd/character_form`).subscribe(result => {
      this.formSectionsRoot = result.json() as Section[];
    }, error => console.error(error));

    this.characterService.getCharactersForUser().subscribe(result => {
      this.character = result.json() as Character;
      this.characterContainer = new CharacterContainer(this.character, this.submit);
    }, error => console.error(error));
  }

  submit(): void {
    this.characterService.addCharacterToUser(this.character).subscribe(result => {
      this.snackBar.open('Enregistré avec succès', 'Fermer', {
        duration: 2000,
      });
    }, error => {
      console.error(error);
      this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', {
        duration: 2000,
      });
    });
  }
}
