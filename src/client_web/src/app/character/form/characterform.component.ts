import { Component } from '@angular/core';

@Component({
    selector: 'character-form',
    templateUrl: './characterform.component.html'
})
export class CharacterFormComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
