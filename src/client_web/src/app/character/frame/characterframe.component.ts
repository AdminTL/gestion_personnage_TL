import { Component } from '@angular/core';

@Component({
    selector: 'character-frame',
    templateUrl: './characterframe.component.html'
})
export class CharacterFrameComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
