import { Component } from '@angular/core';

@Component({
    selector: 'character-attributes',
    templateUrl: './character-attributes.component.html'
})
export class CharacterAttributesComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
