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

  constructor(private characterService: CharacterService, public snackBar: MatSnackBar) {

    this.characterService.getCharacterForm().subscribe(result => {
      this.formSectionsRoot = result.json() as Section[];
    }, error => console.error(error));

    characterService.selectedCharacter$.subscribe(char =>{
      this.character = char;
      this.characterContainer = new CharacterContainer(this.character, () => this.submit(this.characterService));
    }, err => console.log(err));
  }

  submit(service: CharacterService): void {
    service.addCharacterToUser(this.character).subscribe(result => {
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
