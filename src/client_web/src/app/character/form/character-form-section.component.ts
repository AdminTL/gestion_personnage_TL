import { Character } from './../character';
import { CharacterContainer, FormSection, Button, ButtonActions } from './models';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'character-form-section',
    templateUrl: './character-form-section.component.html',
    styleUrls: ['./character-form-section.component.scss']
})
export class CharacterFormSectionComponent {
    @Input()
    public characterContainer: CharacterContainer;

    @Input()
    public formSection: FormSection;

    @Input()
    public depth: number;

    public isDefined(elem: any): boolean {
        return elem !== undefined;
    }

    public handleClick(button: Button) {
        switch (button.action) {
            case ButtonActions.Submit:
                this.characterContainer.submitFct();
                break;
        }
    }
}
