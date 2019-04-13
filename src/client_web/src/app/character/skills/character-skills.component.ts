import { Character } from '../character';
import { Component, Input } from '@angular/core';
import { CharacterService } from '@app/_services/character.service';

@Component({
    selector: 'character-skills',
    templateUrl: './character-skills.component.html'
})
export class CharacterSkillsComponent {
    character: Character;

    constructor(characterService: CharacterService) {
      characterService.selectedCharacter$.subscribe(char => this.character = char, err => console.log(err));
    }
}
