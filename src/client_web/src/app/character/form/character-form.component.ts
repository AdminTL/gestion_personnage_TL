import { Component } from '@angular/core';

@Component({
    selector: 'character-form',
    templateUrl: './character-form.component.html'
})
export class CharacterFormComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
