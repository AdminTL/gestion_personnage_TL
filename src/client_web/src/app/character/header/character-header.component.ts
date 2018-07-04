import { Component, Input } from '@angular/core';
import { CharacterExtensions } from '../character-extensions';

@Component({
    selector: 'character-header',
    templateUrl: './character-header.component.html',
    styleUrls: ['./character-header.component.css']
})
export class CharacterHeaderComponent {
    @Input() public character: Character;
    @Input() private playerMeriteDiff: number;

    isApprobationNew(): boolean{
      return this.character && this.character.approbation.status == 0;
    }

    isApprobationApproved(): boolean{
      return this.character && this.character.approbation.status == 1;
    }

    isApprobationUnapproved(): boolean{
      return this.character && this.character.approbation.status == 2;
    }

    isApprobationInactive(): boolean{
      return this.character && this.character.approbation.status == 3;
    }

    isApprobationToCorrect(): boolean{
      return this.character && this.character.approbation.status == 4;
    }

    xpDiff(): number{
      return CharacterExtensions.countTotalXp(this.character) - CharacterExtensions.countSpentXp(this.character);
    }

    meriteDiff(): number{
      return this.playerMeriteDiff;
    }

    ritualSchoolsDiff(): number{
      return 0; // TODO
    }

    masterTechDiff(): number{
      return 0; // TODO
    }

    validationGreen(): boolean{
      return this.xpDiff() === 0 && this.meriteDiff() === 0
        && this.ritualSchoolsDiff() === 0 && this.masterTechDiff() === 0;
    }

    validationYellow(): boolean{
      return !this.validationGreen() && !this.validationRed();
    }

    validationRed(): boolean{
      return this.xpDiff() < 0 || this.meriteDiff() < 0
        || this.ritualSchoolsDiff() < 0 || this.masterTechDiff() < 0;
    }
}
