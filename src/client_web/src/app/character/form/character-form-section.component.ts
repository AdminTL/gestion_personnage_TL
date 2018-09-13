import { Component, Input } from '@angular/core';

@Component({
    selector: 'character-form-section',
    templateUrl: './character-form-section.component.html',
    styleUrls: ['./character-form-section.component.css']
})
export class CharacterFormSectionComponent {
    public character: Character;

    @Input()
    public formSection: FormSection;

    @Input()
    public depth: number;

    public isDefined(elem: any): boolean {
        return elem !== undefined;
    }
}
